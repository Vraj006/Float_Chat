import { useState, useEffect, useCallback, useRef } from 'react';
import { argoService, ArgoFloat, ArgoProfile } from '@/services/argoService';

export interface UseArgoDataOptions {
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  maxAge?: number; // maximum age of data in minutes
}

export interface ArgoDataState {
  floats: ArgoFloat[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdate: Date | null;
  stats: {
    totalFloats: number;
    activeFloats: number;
    coreArgo: number;
    bgcArgo: number;
  };
}

export const useArgoData = (options: UseArgoDataOptions = {}) => {
  const {
    refreshInterval = 10 * 60 * 1000, // 10 minutes default
    autoRefresh = true,
    maxAge = 30 // 30 minutes default
  } = options;

  const [state, setState] = useState<ArgoDataState>({
    floats: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdate: null,
    stats: {
      totalFloats: 0,
      activeFloats: 0,
      coreArgo: 0,
      bgcArgo: 0
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate stats from floats data
  const calculateStats = useCallback((floats: ArgoFloat[]) => {
    return {
      totalFloats: floats.length,
      activeFloats: floats.filter(f => f.status === 'active').length,
      coreArgo: floats.filter(f => f.type === 'argo').length,
      bgcArgo: floats.filter(f => f.type === 'bgc-argo').length
    };
  }, []);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    if (!state.lastUpdate) return true;
    const ageInMinutes = (Date.now() - state.lastUpdate.getTime()) / (1000 * 60);
    return ageInMinutes > maxAge;
  }, [state.lastUpdate, maxAge]);

  // Fetch Argo data
  const fetchArgoData = useCallback(async (isRefresh = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null
    }));

    try {
      console.log('Fetching Argo float data...');
      const floats = await argoService.getActiveFloats(30);

      const stats = calculateStats(floats);

      setState(prev => ({
        ...prev,
        floats,
        stats,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdate: new Date()
      }));

      console.log(`Successfully loaded ${floats.length} Argo floats`);
    } catch (error) {
      console.error('Error fetching Argo data:', error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Argo data'
      }));
    }
  }, [calculateStats]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchArgoData(true);
  }, [fetchArgoData]);

  // Get detailed profile for a specific float
  const getFloatProfile = useCallback(async (platform: string): Promise<ArgoProfile | null> => {
    try {
      return await argoService.getFloatProfile(platform);
    } catch (error) {
      console.error('Error fetching float profile:', error);
      return null;
    }
  }, []);

  // Get float metadata
  const getFloatMetadata = useCallback(async (platform: string) => {
    try {
      return await argoService.getFloatMetadata(platform);
    } catch (error) {
      console.error('Error fetching float metadata:', error);
      return null;
    }
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (isDataStale()) {
          console.log('Data is stale, refreshing...');
          refresh();
        }
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh, isDataStale]);

  // Initial data fetch
  useEffect(() => {
    fetchArgoData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Helper function to get floats by type
  const getFloatsByType = useCallback((type: 'argo' | 'bgc-argo') => {
    return state.floats.filter(float => float.type === type);
  }, [state.floats]);

  // Helper function to get floats in a specific region
  const getFloatsInRegion = useCallback((bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    return state.floats.filter(float =>
      float.lat <= bounds.north &&
      float.lat >= bounds.south &&
      float.lng <= bounds.east &&
      float.lng >= bounds.west
    );
  }, [state.floats]);

  return {
    ...state,
    refresh,
    getFloatProfile,
    getFloatMetadata,
    getFloatsByType,
    getFloatsInRegion,
    isDataStale: isDataStale()
  };
};