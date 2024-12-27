import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's Stripe account ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account found' }, { status: 404 });
    }

    // Generate a login link for the connected account
    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating login link:', error);
    return NextResponse.json(
      { error: 'Failed to create login link' },
      { status: 500 }
    );
  }
} 