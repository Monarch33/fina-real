import { stripe, PLANS } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { planId, userEmail } = await req.json();

    const plan = PLANS[planId as keyof typeof PLANS];
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `FINA ${plan.name}`,
              description: 'AI-Powered Finance Interview Preparation',
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/arena?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`,
      customer_email: userEmail,
      metadata: {
        planId: plan.id,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
