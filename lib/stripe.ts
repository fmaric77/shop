import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any>;

// Fetch publishable key from the StoreSettings API and initialize Stripe
const getStripe = () => {
  if (!stripePromise) {
    // Lazy-load Stripe with key from settings
    stripePromise = fetch('/api/store-settings')
      .then(res => res.json())
      .then((settings: any) => {
        const key = settings.stripe?.publishableKey;
        if (!key) {
          throw new Error('Stripe publishable key not configured in store settings');
        }
        return loadStripe(key);
      });
  }
  return stripePromise;
};

export default getStripe;
