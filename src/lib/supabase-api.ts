import { supabase } from './supabase';
import type { SKU, Sale, Activity, SyncStatus } from './supabase';

// SKU Operations
export async function getAllSKUs(): Promise<SKU[]> {
  const { data, error } = await supabase
    .from('skus')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getSKUById(id: string): Promise<SKU | null> {
  const { data, error } = await supabase
    .from('skus')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSKUBySKU(sku: string): Promise<SKU | null> {
  const { data, error } = await supabase
    .from('skus')
    .select('*')
    .eq('sku', sku)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createSKU(sku: Omit<SKU, 'id' | 'created_at' | 'updated_at'>): Promise<SKU> {
  const { data, error } = await supabase
    .from('skus')
    .insert(sku)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSKU(id: string, updates: Partial<SKU>): Promise<SKU> {
  const { data, error } = await supabase
    .from('skus')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addStockToSKU(id: string, quantity: number): Promise<SKU> {
  const sku = await getSKUById(id);
  if (!sku) throw new Error('SKU not found');

  const newTotalStock = sku.total_stock + quantity;
  const newAvailableStock = newTotalStock - sku.reserved_stock;

  return updateSKU(id, {
    total_stock: newTotalStock,
    available_stock: newAvailableStock,
  });
}

export async function removeStockFromSKU(id: string, quantity: number): Promise<SKU> {
  const sku = await getSKUById(id);
  if (!sku) throw new Error('SKU not found');

  const newTotalStock = Math.max(0, sku.total_stock - quantity);
  const newAvailableStock = Math.max(0, newTotalStock - sku.reserved_stock);

  return updateSKU(id, {
    total_stock: newTotalStock,
    available_stock: newAvailableStock,
  });
}

// Sales Operations
export async function getAllSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createSale(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Activity Operations
export async function getAllActivities(limit: number = 100): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function createActivity(
  type: Activity['type'],
  message: string,
  meta?: Record<string, any>
): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert({ type, message, meta })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sync Status Operations
export async function getSyncStatus(): Promise<SyncStatus> {
  const { data, error } = await supabase
    .from('sync_status')
    .select('*')
    .limit(1)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSyncStatus(status: 'idle' | 'running' | 'error', errorMessage?: string): Promise<SyncStatus> {
  const { data: existing } = await supabase
    .from('sync_status')
    .select('id')
    .limit(1)
    .single();

  if (!existing) {
    // Create if doesn't exist
    const { data, error } = await supabase
      .from('sync_status')
      .insert({
        last_run: new Date().toISOString(),
        status,
        next_run: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        error_message: errorMessage,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('sync_status')
    .update({
      last_run: new Date().toISOString(),
      status,
      next_run: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      error_message: errorMessage,
    })
    .eq('id', existing.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Settings Operations
export async function getSetting(key: string): Promise<any> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) return null;
  return data?.value;
}

export async function setSetting(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value });
  
  if (error) throw error;
}
