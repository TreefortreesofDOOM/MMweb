import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server-utils';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      console.error('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an approved artist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, stripe_account_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Profile fetch error' }, { status: 500 });
    }

    if (!profile || profile.role !== 'artist') {
      console.error('User is not an artist:', profile?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If artist already has a Stripe account, check its status
    if (profile.stripe_account_id) {
      console.log('Found existing Stripe account:', profile.stripe_account_id);
      
      try {
        // Retrieve the account to check its status
        const account = await stripe.accounts.retrieve(profile.stripe_account_id);
        
        // If the account is fully set up, create a login link instead
        if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
          console.log('Account is fully set up, creating login link');
          const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);
          console.log('Created login link:', loginLink.url);
          return NextResponse.json({ url: loginLink.url });
        }
        
        // Otherwise, create a new account link for onboarding
        console.log('Creating new account link for existing account');
        const accountLink = await stripe.accountLinks.create({
          account: profile.stripe_account_id,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?error=refresh`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?success=true`,
          type: 'account_onboarding',
          collect: 'currently_due'
        });
        console.log('Created account link for existing account:', accountLink.url);
        return NextResponse.json({ url: accountLink.url });
      } catch (error) {
        // Check if the error is because the account doesn't exist
        if (error instanceof Error && error.message.includes('No such account')) {
          console.log('Stripe account no longer exists, clearing from profile');
          // Clear the invalid stripe_account_id from the profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              stripe_account_id: null,
              stripe_onboarding_complete: false,
              stripe_charges_enabled: false,
              stripe_payouts_enabled: false,
              stripe_external_account_setup: false
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error clearing invalid Stripe account:', updateError);
            return NextResponse.json(
              { error: 'Failed to clear invalid Stripe account' },
              { status: 500 }
            );
          }
        } else {
          // For other types of errors, return an error response
          console.error('Error retrieving Stripe account:', error);
          return NextResponse.json(
            { error: 'Failed to retrieve Stripe account' },
            { status: 500 }
          );
        }
      }
    }

    // Only proceed to create a new account if there isn't one or if we just cleared an invalid one
    console.log('Creating new Stripe Connect account for user:', user.email);
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            interval: 'manual'
          },
        },
        payments: {
          statement_descriptor: 'MM Platform',
        }
      },
      metadata: {
        user_id: user.id,
        environment: process.env.NODE_ENV || 'development'
      }
    });
    console.log('Created Stripe account:', account.id);

    // Update profile with Stripe account ID
    console.log('Updating profile with Stripe account ID');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    console.log('Profile updated successfully');

    // Create account link for onboarding
    console.log('Creating account link for onboarding');
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?error=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?success=true`,
      type: 'account_onboarding',
    });
    console.log('Created account link:', accountLink.url);

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 