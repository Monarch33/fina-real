import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 1900, // in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 4900,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 9900,
    priceId: process.env.STRIPE_ELITE_PRICE_ID,
  },
};
