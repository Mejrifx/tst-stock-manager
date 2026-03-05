export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
  refreshToken?: string;
}

export const getEbayConfig = (): EbayConfig => {
  return {
    clientId: import.meta.env.VITE_EBAY_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_EBAY_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_EBAY_REDIRECT_URI || 'http://localhost:8080/auth/ebay/callback',
    environment: (import.meta.env.VITE_EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    refreshToken: import.meta.env.VITE_EBAY_REFRESH_TOKEN,
  };
};

export const getEbayApiBase = (environment: 'sandbox' | 'production'): string => {
  return environment === 'sandbox'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';
};

export const getEbayAuthBase = (environment: 'sandbox' | 'production'): string => {
  return environment === 'sandbox'
    ? 'https://auth.sandbox.ebay.com'
    : 'https://auth.ebay.com';
};

export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  'https://api.ebay.com/oauth/api_scope/sell.account',
];
