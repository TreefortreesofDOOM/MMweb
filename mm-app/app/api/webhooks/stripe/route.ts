import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    console.log('\n=== WEBHOOK REQUEST RECEIVED ===');
    console.log('Time:', new Date().toISOString());
    console.log('Raw Headers:', Object.fromEntries(req.headers));
    
    // Get the raw request body as a string
    const rawBody = await req.text();
    console.log('Raw Body:', rawBody.substring(0, 500) + '...');
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new NextResponse(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '1'
          }
        }
      );
    }

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    console.log('Headers received:', {
      'stripe-signature': signature,
      'content-type': req.headers.get('content-type'),
      'content-length': req.headers.get('content-length')
    });

    if (!signature) {
      console.error('No signature found in request');
      return new NextResponse(
        JSON.stringify({ error: 'No signature found' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '1'
          }
        }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('Webhook verified successfully');
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Processing webhook:', {
      type: event.type,
      id: event.id,
      accountId: event.account
    });

    // Check if we've already processed this event
    const supabase = await createClient();
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', event.id);
      return NextResponse.json({ received: true });
    }

    // Mark event as processed
    const { error: insertError } = await supabase
      .from('stripe_events')
      .insert({ event_id: event.id, type: event.type });

    if (insertError) {
      console.error('Error recording event:', insertError);
    }

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log('Account updated:', {
          accountId: account.id,
          details_submitted: account.details_submitted
        });

        // Only update if details are submitted
        if (account.details_submitted) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              stripe_onboarding_complete: true
            })
            .eq('stripe_account_id', account.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            console.log('Profile updated successfully');
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        await supabase
          .from('transactions')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }
    }

    // Store the event ID to prevent duplicate processing
    await supabase
      .from('stripe_events')
      .insert([{ event_id: event.id }]);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  return new NextResponse(
    JSON.stringify({ message: 'Stripe webhook endpoint is active' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1'
      }
    }
  );
} 