import axios from 'axios';
import { getEbayConfig, getEbayAuthBase } from './config';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class EbayClient {
  private config = getEbayConfig();
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async getAccessToken(): Promise<string | null> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Get refresh token from localStorage or config
    const refreshToken = localStorage.getItem('ebay_refresh_token') || this.config.refreshToken;
    
    if (!refreshToken) {
      console.warn('No eBay refresh token available');
      return null;
    }

    try {
      const response = await axios.post<TokenResponse>(
        '/.netlify/functions/ebay-oauth-refresh',
        { refreshToken }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 min early
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh eBay access token:', error);
      return null;
    }
  }

  async request<T>(method: string, endpoint: string, body?: any): Promise<T> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No eBay access token available');
    }

    // Use Netlify Function proxy to avoid CORS
    const response = await axios.post('/.netlify/functions/ebay-api-proxy', {
      accessToken,
      method,
      endpoint,
      body,
    });
    
    return response.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  getAuthUrl(state?: string): string {
    const scopes = [
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      'https://api.ebay.com/oauth/api_scope/sell.account',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes,
      ...(state && { state }),
    });

    return `${getEbayAuthBase(this.config.environment)}/oauth2/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await axios.post<TokenResponse & { refresh_token: string }>(
      '/.netlify/functions/ebay-oauth-exchange',
      {
        code,
        redirectUri: this.config.redirectUri,
      }
    );

    const refreshToken = response.data.refresh_token;
    localStorage.setItem('ebay_refresh_token', refreshToken);
    
    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

    return refreshToken;
  }

  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  isConnected(): boolean {
    return !!(localStorage.getItem('ebay_refresh_token') || this.config.refreshToken);
  }
}

export const ebayClient = new EbayClient();
