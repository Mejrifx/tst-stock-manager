import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure URL has protocol
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.warn('⚠️ VITE_SUPABASE_URL missing protocol, adding https://');
  supabaseUrl = `https://${supabaseUrl}`;
}

console.log('🔧 Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface SKU {
  id: string;
  sku: string;
  model: string;
  grade: string;
  storage: string;
  colour: string;
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  ebay_listing_id?: string;
  ebay_listed_quantity: number;
  cap_quantity: number;
  price: number;
  title: string;
  created_at: string;
  last_synced_at?: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  order_id: string;
  sku_id: string;
  sku: string;
  quantity: number;
  buyer: string;
  sale_date: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
}

export interface Activity {
  id: string;
  type: 'EBAY_SALE_DETECTED' | 'QUANTITY_REPLENISHED' | 'STOCK_ADJUSTED' | 'LISTING_CREATED' | 'LISTING_ENDED' | 'SYNC_SUCCESS' | 'SYNC_ERROR' | 'STATUS_CHANGE' | 'ERROR' | 'WARNING' | 'SALE' | 'REPLENISH' | 'STOCK_ADD' | 'STOCK_REMOVE';
  message: string;
  meta?: Record<string, any>;
  created_at: string;
}

export interface SyncStatus {
  id: string;
  last_run: string;
  status: 'idle' | 'running' | 'error';
  next_run: string;
  error_message?: string;
  updated_at: string;
}

export interface Settings {
  key: string;
  value: any;
  updated_at: string;
}
