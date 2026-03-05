import axios, { AxiosInstance } from 'axios';
import { getEbayConfig, getEbayApiBase, getEbayAuthBase } from './config';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class EbayClient {
  private config = getEbayConfig();
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: getEbayApiBase(this.config.environment),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor to inject auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

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
        `${getEbayApiBase(this.config.environment)}/identity/v1/oauth2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 min early
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh eBay access token:', error);
      return null;
    }
  }

  async request<T>(method: string, path: string, data?: any): Promise<T> {
    const response = await this.api.request<T>({
      method,
      url: path,
      data,
    });
    return response.data;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('POST', path, data);
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PUT', path, data);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
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
      `${getEbayApiBase(this.config.environment)}/identity/v1/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
        },
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
