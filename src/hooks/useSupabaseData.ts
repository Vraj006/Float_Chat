import { useState, useEffect } from 'react';
import { supabase, Database } from '@/lib/supabase';

type TemperatureData = Database['public']['Tables']['ocean_temperature']['Row'];
type MarineLifeData = Database['public']['Tables']['marine_life']['Row'];
type MetricsData = Database['public']['Tables']['ocean_metrics']['Row'];

// Hook for ocean temperature data
export const useTemperatureData = (filters?: {
  timeRange?: string;
  region?: string;
  depth?: string;
}) => {
  const [data, setData] = useState<TemperatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemperatureData();
  }, [filters]);

  const fetchTemperatureData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ocean_temperature')
        .select('*')
        .order('timestamp', { ascending: true });

      // Apply filters
      if (filters?.region && filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters?.timeRange && filters.timeRange !== 'all') {
        const timeFilter = getTimeFilter(filters.timeRange);
        if (timeFilter) {
          query = query.gte('timestamp', timeFilter);
        }
      }

      if (filters?.depth && filters.depth !== 'all') {
        const depthRange = getDepthRange(filters.depth);
        if (depthRange) {
          query = query
            .gte('depth', depthRange.min)
            .lte('depth', depthRange.max);
        }
      }

      const { data: tempData, error: tempError } = await query;

      if (tempError) {
        throw tempError;
      }

      setData(tempData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch temperature data');
      console.error('Temperature data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchTemperatureData };
};

// Hook for marine life data
export const useMarineLifeData = (filters?: {
  timeRange?: string;
  region?: string;
  depth?: string;
}) => {
  const [data, setData] = useState<MarineLifeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarineLifeData();
  }, [filters]);

  const fetchMarineLifeData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('marine_life')
        .select('*')
        .order('observation_date', { ascending: true });

      // Apply filters
      if (filters?.region && filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters?.timeRange && filters.timeRange !== 'all') {
        const timeFilter = getTimeFilter(filters.timeRange);
        if (timeFilter) {
          query = query.gte('observation_date', timeFilter);
        }
      }

      if (filters?.depth && filters.depth !== 'all') {
        query = query.eq('depth_range', filters.depth);
      }

      const { data: marineData, error: marineError } = await query;

      if (marineError) {
        throw marineError;
      }

      setData(marineData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marine life data');
      console.error('Marine life data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchMarineLifeData };
};

// Hook for ocean metrics data
export const useOceanMetrics = (filters?: {
  timeRange?: string;
  region?: string;
}) => {
  const [data, setData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetricsData();
  }, [filters]);

  const fetchMetricsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ocean_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      // Apply filters
      if (filters?.region && filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters?.timeRange && filters.timeRange !== 'all') {
        const timeFilter = getTimeFilter(filters.timeRange);
        if (timeFilter) {
          query = query.gte('timestamp', timeFilter);
        }
      }

      const { data: metricsData, error: metricsError } = await query;

      if (metricsError) {
        throw metricsError;
      }

      setData(metricsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ocean metrics');
      console.error('Ocean metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchMetricsData };
};

// Hook for real-time latest metrics
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    temperature: 0,
    waveHeight: 0,
    species: 0,
    salinity: 0,
    ph: 0,
    oxygen: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestMetrics();

    // Set up real-time subscription
    const subscription = supabase
      .channel('ocean_metrics_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ocean_metrics' },
        (payload) => {
          console.log('New metrics data:', payload.new);
          fetchLatestMetrics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLatestMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get latest temperature
      const { data: tempData } = await supabase
        .from('ocean_temperature')
        .select('temperature')
        .order('timestamp', { ascending: false })
        .limit(1);

      // Get latest ocean metrics
      const { data: metricsData } = await supabase
        .from('ocean_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      // Get species count
      const { count: speciesCount } = await supabase
        .from('marine_life')
        .select('*', { count: 'exact', head: true });

      const latestMetrics = metricsData?.[0];

      setMetrics({
        temperature: tempData?.[0]?.temperature || 0,
        waveHeight: latestMetrics?.wave_height || 0,
        species: speciesCount || 0,
        salinity: latestMetrics?.salinity || 0,
        ph: latestMetrics?.ph || 0,
        oxygen: latestMetrics?.oxygen || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time metrics');
      console.error('Real-time metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refetch: fetchLatestMetrics };
};

// Utility functions
const getTimeFilter = (timeRange: string): string | null => {
  const now = new Date();
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return null;
  }
};

const getDepthRange = (depth: string): { min: number; max: number } | null => {
  switch (depth) {
    case 'surface':
      return { min: 0, max: 50 };
    case 'shallow':
      return { min: 50, max: 200 };
    case 'deep':
      return { min: 200, max: 1000 };
    case 'abyssal':
      return { min: 1000, max: 10000 };
    default:
      return null;
  }
};