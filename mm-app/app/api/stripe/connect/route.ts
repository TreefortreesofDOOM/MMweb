import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe-server';

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

    // If artist already has a Stripe account, return the onboarding link
    if (profile.stripe_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?error=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?success=true`,
        type: 'account_onboarding',
      });
      return NextResponse.json({ url: accountLink.url });
    }

    // Create a new Stripe Connect Express account
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
            interval: 'manual', // Platform controls payouts initially
          },
        },
      },
    });

    // Update profile with Stripe account ID
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

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?error=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/dashboard?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 