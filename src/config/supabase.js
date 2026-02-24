import { createClient } from '@supabase/supabase-js';
import config from './database.js';

let supabaseClient = null;

export const initSupabase = () => {
  if (!supabaseClient) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      console.warn('⚠️  Supabase no configurado - usando BD local');
      return null;
    }

    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );
  }
  return supabaseClient;
};

export const getSupabase = () => {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
};

export default {
  initSupabase,
  getSupabase,
};
