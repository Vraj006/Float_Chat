// Data transformation utilities for ocean data visualization

export interface OceanDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  temperature?: number;
  depth?: number;
  salinity?: number;
  ph?: number;
  species?: string;
  timestamp?: string;
}

export const transformTemperatureData = (data: OceanDataPoint[]) => {
  return data.map(point => ({
    name: `${point.latitude.toFixed(2)}, ${point.longitude.toFixed(2)}`,
    temperature: point.temperature || 0,
    depth: point.depth || 0
  }));
};

export const transformMarineLifeByDepth = (data: OceanDataPoint[]) => {
  const depthRanges = [
    { name: '0-100m', min: 0, max: 100, count: 0 },
    { name: '100-500m', min: 100, max: 500, count: 0 },
    { name: '500-1000m', min: 500, max: 1000, count: 0 },
    { name: '1000m+', min: 1000, max: Infinity, count: 0 }
  ];

  data.forEach(point => {
    const depth = point.depth || 0;
    const range = depthRanges.find(r => depth >= r.min && depth < r.max);
    if (range) range.count++;
  });

  return depthRanges;
};

export const transformSpeciesDistribution = (data: OceanDataPoint[]) => {
  const species: { [key: string]: number } = {};

  data.forEach(point => {
    if (point.species) {
      species[point.species] = (species[point.species] || 0) + 1;
    }
  });

  return Object.entries(species).map(([name, value]) => ({ name, value }));
};

export const transformDataForHeatmap = (data: OceanDataPoint[]) => {
  return data.map(point => ({
    x: point.longitude,
    y: point.latitude,
    z: point.temperature || 0
  }));
};

export const transformDataForScatter = (data: OceanDataPoint[]) => {
  return data.map(point => ({
    x: point.depth || 0,
    y: point.temperature || 0,
    z: point.salinity || 0
  }));
};

export const getDataStatistics = (data: OceanDataPoint[]) => {
  const temperatures = data.filter(d => d.temperature).map(d => d.temperature!);
  const depths = data.filter(d => d.depth).map(d => d.depth!);

  return {
    totalPoints: data.length,
    avgTemperature: temperatures.length ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
    maxDepth: depths.length ? Math.max(...depths) : 0,
    minDepth: depths.length ? Math.min(...depths) : 0
  };
};