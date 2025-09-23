import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types - you'll need to generate these from your Supabase project
export type Database = {
  public: {
    Tables: {
      // Example oceanographic data tables - replace with your actual schema
      ocean_temperature: {
        Row: {
          id: string;
          timestamp: string;
          temperature: number;
          depth: number;
          latitude: number;
          longitude: number;
          region: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          temperature: number;
          depth: number;
          latitude: number;
          longitude: number;
          region: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          temperature?: number;
          depth?: number;
          latitude?: number;
          longitude?: number;
          region?: string;
          created_at?: string;
        };
      };
      marine_life: {
        Row: {
          id: string;
          species_name: string;
          count: number;
          depth_range: string;
          region: string;
          observation_date: string;
          temperature: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          species_name: string;
          count: number;
          depth_range: string;
          region: string;
          observation_date: string;
          temperature: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          species_name?: string;
          count?: number;
          depth_range?: string;
          region?: string;
          observation_date?: string;
          temperature?: number;
          created_at?: string;
        };
      };
      ocean_metrics: {
        Row: {
          id: string;
          timestamp: string;
          wave_height: number;
          salinity: number;
          ph: number;
          oxygen: number;
          region: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          wave_height: number;
          salinity: number;
          ph: number;
          oxygen: number;
          region: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          wave_height?: number;
          salinity?: number;
          ph?: number;
          oxygen?: number;
          region?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Export typed client
export type SupabaseClient = typeof supabase;