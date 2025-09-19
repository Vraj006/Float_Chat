import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Tooltip, Legend } from "recharts";
import { Thermometer, Waves, Fish, TrendingUp, Activity, Zap, Download, Share, Expand, Grid, BarChart3, Maximize2, Menu, X, Filter, Calendar, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

const DataVisualization = () => {
  const [temperatureData, setTemperatureData] = useState([
    { month: 'Jan', temp: 18.5 }, { month: 'Feb', temp: 19.2 }, { month: 'Mar', temp: 20.1 },
    { month: 'Apr', temp: 21.8 }, { month: 'May', temp: 23.4 }, { month: 'Jun', temp: 25.1 },
    { month: 'Jul', temp: 26.8 }, { month: 'Aug', temp: 27.2 }, { month: 'Sep', temp: 26.1 },
    { month: 'Oct', temp: 24.3 }, { month: 'Nov', temp: 21.9 }, { month: 'Dec', temp: 19.7 }
  ]);

  const [marineLifeData, setMarineLifeData] = useState([
    { depth: '0-25m', species: 342, temp: 24 }, { depth: '25-200m', species: 189, temp: 18 },
    { depth: '200-1000m', species: 67, temp: 12 }, { depth: '1000m+', species: 23, temp: 4 }
  ]);

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    temperature: 23.2,
    waveHeight: 2.4,
    species: 1247,
    salinity: 34.8,
    ph: 8.1,
    oxygen: 95.7
  });

  const speciesDistribution = [
    { name: 'Fish', value: 45, color: '#00D4FF' },
    { name: 'Coral', value: 25, color: '#00FFA3' },
    { name: 'Mammals', value: 15, color: '#FFB800' },
    { name: 'Others', value: 15, color: '#FF6B9D' }
  ];

  // Advanced chart data
  const [heatmapData, setHeatmapData] = useState([
    { depth: '0m', region: 'North', temp: 24.5, salinity: 34.2 },
    { depth: '0m', region: 'Central', temp: 26.1, salinity: 35.1 },
    { depth: '0m', region: 'South', temp: 22.8, salinity: 33.8 },
    { depth: '50m', region: 'North', temp: 20.2, salinity: 34.8 },
    { depth: '50m', region: 'Central', temp: 22.5, salinity: 35.4 },
    { depth: '50m', region: 'South', temp: 19.1, salinity: 34.1 },
    { depth: '100m', region: 'North', temp: 16.8, salinity: 35.2 },
    { depth: '100m', region: 'Central', temp: 18.2, salinity: 35.8 },
    { depth: '100m', region: 'South', temp: 15.5, salinity: 34.9 },
  ]);

  const [scatterData, setScatterData] = useState([
    { temp: 24.5, salinity: 34.2, species: 342, ph: 8.1 },
    { temp: 22.1, salinity: 35.1, species: 298, ph: 8.0 },
    { temp: 20.8, salinity: 33.8, species: 267, ph: 7.9 },
    { temp: 18.2, salinity: 34.8, species: 189, ph: 7.8 },
    { temp: 16.5, salinity: 35.4, species: 156, ph: 7.7 },
    { temp: 14.1, salinity: 34.1, species: 98, ph: 7.6 },
    { temp: 12.8, salinity: 35.2, species: 67, ph: 7.5 },
    { temp: 8.2, salinity: 35.8, species: 34, ph: 7.4 },
    { temp: 4.5, salinity: 34.9, species: 23, ph: 7.3 },
  ]);

  // Dashboard state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter and control states
  const [filters, setFilters] = useState({
    timeRange: '7d',
    region: 'all',
    depth: 'all',
    dataType: 'all'
  });
  const [isLiveData, setIsLiveData] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLiveData) {
        setRealTimeMetrics(prev => ({
          ...prev,
          temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
          waveHeight: Math.max(0, prev.waveHeight + (Math.random() - 0.5) * 0.3),
          species: prev.species + Math.floor((Math.random() - 0.5) * 20),
        }));
        setLastUpdate(new Date());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveData]);

  // Export functionality
  const handleExportData = (format) => {
    const exportData = {
      timestamp: new Date().toISOString(),
      realTimeMetrics,
      temperatureData,
      marineLifeData,
      heatmapData,
      scatterData,
      filters
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ocean-data-${Date.now()}.json`;
      link.click();
    } else if (format === 'csv') {
      const csvData = temperatureData.map(row => `${row.month},${row.temp}`).join('\n');
      const csvContent = 'Month,Temperature\n' + csvData;
      const dataBlob = new Blob([csvContent], {type: 'text/csv'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ocean-temperature-${Date.now()}.csv`;
      link.click();
    }
  };

  // Filter components
  const FilterSelect = ({ label, value, options, onChange }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  // Live data indicator component
  const LiveDataIndicator = () => (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      <span className="text-xs text-muted-foreground">
        {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
      </span>
      <span className="text-xs text-muted-foreground">
        {lastUpdate.toLocaleTimeString()}
      </span>
    </div>
  );

  // Custom Heatmap Component
  const HeatmapChart = ({ data, title }) => {
    const depths = [...new Set(data.map(d => d.depth))];
    const regions = [...new Set(data.map(d => d.region))];

    const getTemperatureColor = (temp) => {
      const normalized = (temp - 4) / (26 - 4);
      const hue = (1 - normalized) * 240; // Blue to Red
      return `hsl(${hue}, 70%, 50%)`;
    };

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="grid grid-cols-3 gap-1">
          {depths.map(depth =>
            regions.map(region => {
              const point = data.find(d => d.depth === depth && d.region === region);
              return (
                <div
                  key={`${depth}-${region}`}
                  className="aspect-square rounded flex flex-col items-center justify-center text-xs p-2 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: getTemperatureColor(point?.temp || 0) }}
                >
                  <div className="text-white font-semibold">{point?.temp}°</div>
                  <div className="text-white/80 text-[10px]">{region}</div>
                  <div className="text-white/60 text-[9px]">{depth}</div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>4°C</span>
          <span>Temperature Scale</span>
          <span>26°C</span>
        </div>
      </div>
    );
  };

  // Tab Navigation Component
  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary text-primary-foreground shadow-glow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle background elements */}
      <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl opacity-20 z-0"></div>
      <div className="absolute -top-32 right-1/3 w-96 h-96 bg-accent/2 rounded-full blur-3xl opacity-15 z-0"></div>

      <Navbar />

      {/* Fullscreen Chart Modal */}
      <AnimatePresence>
        {fullscreenChart && (
          <motion.div
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-6xl bg-background border border-border rounded-xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">{fullscreenChart.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenChart(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-96">
                {fullscreenChart.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 bg-background/95 backdrop-blur-sm border-r border-border z-40 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Detailed Metrics</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ocean Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Salinity</span>
                        <span className="text-sm font-medium">{realTimeMetrics.salinity}‰</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">pH Level</span>
                        <span className="text-sm font-medium">{realTimeMetrics.ph}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Oxygen</span>
                        <span className="text-sm font-medium">{realTimeMetrics.oxygen.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Data Quality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Floats</span>
                        <span className="text-sm font-medium text-green-400">23/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data Coverage</span>
                        <span className="text-sm font-medium text-green-400">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Update</span>
                        <span className="text-sm font-medium">2 min ago</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="pt-20 px-6 pb-12">
            <div className="container mx-auto space-y-8">
              {/* Header with Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-headline">
                    Ocean Analytics Dashboard
                  </h1>
                  <p className="text-muted-foreground text-body mt-2">
                    Real-time oceanographic data analysis with professional visualization tools
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <LiveDataIndicator />
                  <Button
                    variant={isLiveData ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsLiveData(!isLiveData)}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLiveData ? 'animate-spin' : ''}`} />
                    {isLiveData ? 'Live' : 'Paused'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2"
                  >
                    <Menu className="h-4 w-4" />
                    Detailed View
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    {exportDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            handleExportData('json');
                            setExportDropdownOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-t-lg"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={() => {
                            handleExportData('csv');
                            setExportDropdownOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-b-lg"
                        >
                          Export CSV
                        </button>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                <TabButton
                  id="overview"
                  label="Overview"
                  icon={Grid}
                  active={activeTab === 'overview'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="temperature"
                  label="Temperature"
                  icon={Thermometer}
                  active={activeTab === 'temperature'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="marine"
                  label="Marine Life"
                  icon={Fish}
                  active={activeTab === 'marine'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="correlations"
                  label="Correlations"
                  icon={TrendingUp}
                  active={activeTab === 'correlations'}
                  onClick={setActiveTab}
                />
              </div>

              {/* Filter Controls */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Filters</span>
                    </div>

                    <FilterSelect
                      label="Time Range"
                      value={filters.timeRange}
                      options={[
                        { value: '1h', label: 'Last Hour' },
                        { value: '24h', label: 'Last 24 Hours' },
                        { value: '7d', label: 'Last 7 Days' },
                        { value: '30d', label: 'Last 30 Days' },
                        { value: 'custom', label: 'Custom Range' }
                      ]}
                      onChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}
                    />

                    <FilterSelect
                      label="Region"
                      value={filters.region}
                      options={[
                        { value: 'all', label: 'All Regions' },
                        { value: 'north', label: 'North Pacific' },
                        { value: 'central', label: 'Central Pacific' },
                        { value: 'south', label: 'South Pacific' },
                        { value: 'atlantic', label: 'Atlantic' }
                      ]}
                      onChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                    />

                    <FilterSelect
                      label="Depth Zone"
                      value={filters.depth}
                      options={[
                        { value: 'all', label: 'All Depths' },
                        { value: 'surface', label: '0-50m' },
                        { value: 'shallow', label: '50-200m' },
                        { value: 'deep', label: '200-1000m' },
                        { value: 'abyssal', label: '1000m+' }
                      ]}
                      onChange={(value) => setFilters(prev => ({ ...prev, depth: value }))}
                    />

                    <FilterSelect
                      label="Data Type"
                      value={filters.dataType}
                      options={[
                        { value: 'all', label: 'All Data' },
                        { value: 'temperature', label: 'Temperature' },
                        { value: 'salinity', label: 'Salinity' },
                        { value: 'marine_life', label: 'Marine Life' },
                        { value: 'chemistry', label: 'Chemistry' }
                      ]}
                      onChange={(value) => setFilters(prev => ({ ...prev, dataType: value }))}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ timeRange: '7d', region: 'all', depth: 'all', dataType: 'all' })}
                      className="flex items-center gap-2"
                    >
                      <X className="h-3 w-3" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Real-time Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Temperature Card */}
                      <Card className="glass-card border-border hover:border-primary/40 transition-all duration-200 group relative overflow-hidden">
                        {isLiveData && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse m-2"></div>
                        )}
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
                          <Thermometer className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold text-orange-500 animate-pulse">
                            {realTimeMetrics.temperature.toFixed(1)}°C
                          </div>
                          <p className="text-green-400 text-xs flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3" />
                            +1.2° from last month
                          </p>
                          {isLiveData && (
                            <div className="mt-2 h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/60 to-orange-500/20 rounded-full animate-pulse"></div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Wave Height Card */}
                      <Card className="glass-card border-border hover:border-primary/40 transition-all duration-200 group relative overflow-hidden">
                        {isLiveData && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse m-2"></div>
                        )}
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Wave Height</CardTitle>
                          <Waves className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold text-primary animate-pulse">
                            {realTimeMetrics.waveHeight.toFixed(1)}m
                          </div>
                          <p className="text-red-400 text-xs flex items-center gap-1 mt-2">
                            <Activity className="h-3 w-3" />
                            -0.3m from average
                          </p>
                          {isLiveData && (
                            <div className="mt-2 h-1 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 rounded-full animate-pulse"></div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Species Count Card */}
                      <Card className="glass-card border-border hover:border-accent/40 transition-all duration-200 group relative overflow-hidden">
                        {isLiveData && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse m-2"></div>
                        )}
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Marine Species</CardTitle>
                          <Fish className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold text-accent animate-pulse">
                            {realTimeMetrics.species.toLocaleString()}
                          </div>
                          <p className="text-green-400 text-xs flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3" />
                            +89 new species found
                          </p>
                          {isLiveData && (
                            <div className="mt-2 h-1 bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20 rounded-full animate-pulse"></div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Temperature Trends */}
            <Card className="glass-card border-border hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground text-headline flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Temperature Trends
                  </CardTitle>
                </div>
                <Zap className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={temperatureData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <Bar 
                      dataKey="temp" 
                      fill="url(#tempGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#FF8E00" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Marine Life Activity */}
            <Card className="glass-card border-border hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground text-headline flex items-center gap-2">
                    <Fish className="h-5 w-5 text-accent" />
                    Marine Life Distribution
                  </CardTitle>
                </div>
                <Activity className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marineLifeData}>
                    <XAxis 
                      dataKey="depth" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <Bar 
                      dataKey="species" 
                      fill="url(#speciesGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="speciesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ocean Depth Analysis */}
          <Card className="glass-card border-border hover:shadow-md transition-all duration-200 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground text-headline flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Depth Zone Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {marineLifeData.map((zone, index) => (
                  <div key={zone.depth} className="glass rounded-lg p-6 hover:bg-primary/10 transition-all duration-300 group">
                    <div className="text-center space-y-3">
                      <div className="text-lg font-semibold text-primary glow-text">
                        {zone.depth}
                      </div>
                      <div className="text-sm text-foreground/70 capitalize">
                        {index === 0 ? 'Sunlight Zone' : 
                         index === 1 ? 'Twilight Zone' : 
                         index === 2 ? 'Midnight Zone' : 'Abyssal Zone'}
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-accent group-hover:animate-pulse">
                          {zone.species}
                        </div>
                        <div className="text-xs text-foreground/60">Species</div>
                        <div className="text-lg font-semibold text-orange-400">
                          {zone.temp}°C
                        </div>
                        <div className="text-xs text-foreground/60">Temp</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

                  </motion.div>
                )}

                {activeTab === 'temperature' && (
                  <motion.div
                    key="temperature"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Thermometer className="h-5 w-5 text-orange-500" />
                            Temperature Heatmap
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFullscreenChart({
                              title: 'Temperature Heatmap',
                              content: <HeatmapChart data={heatmapData} title="Ocean Temperature by Region & Depth" />
                            })}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <HeatmapChart data={heatmapData} title="Ocean Temperature by Region & Depth" />
                        </CardContent>
                      </Card>

                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Monthly Trends
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={temperatureData}>
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="temp" stroke="#FF6B35" strokeWidth={3} dot={{ fill: '#FF6B35', strokeWidth: 2, r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'marine' && (
                  <motion.div
                    key="marine"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Species Distribution Pie Chart */}
                      <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Fish className="h-5 w-5 text-accent" />
                            Species Distribution
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFullscreenChart({
                              title: 'Marine Species Distribution',
                              content: (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={speciesDistribution}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={120}
                                      dataKey="value"
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                      {speciesDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              )
                            })}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={speciesDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {speciesDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Marine Life by Depth */}
                      <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Life by Depth Zone
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFullscreenChart({
                              title: 'Marine Life by Depth Zone',
                              content: (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={marineLifeData}>
                                    <XAxis dataKey="depth" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="species" fill="url(#speciesGradient)" radius={[4, 4, 0, 0]} />
                                    <defs>
                                      <linearGradient id="speciesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.6} />
                                      </linearGradient>
                                    </defs>
                                  </BarChart>
                                </ResponsiveContainer>
                              )
                            })}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={marineLifeData}>
                              <XAxis
                                dataKey="depth"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                              />
                              <Tooltip />
                              <Bar
                                dataKey="species"
                                fill="url(#speciesGradient2)"
                                radius={[4, 4, 0, 0]}
                              />
                              <defs>
                                <linearGradient id="speciesGradient2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.8} />
                                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.6} />
                                </linearGradient>
                              </defs>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Ocean Depth Analysis - Enhanced for Marine Life */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-foreground text-headline flex items-center gap-2">
                          <Waves className="h-5 w-5 text-primary" />
                          Marine Ecosystem Zones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {marineLifeData.map((zone, index) => (
                            <div key={zone.depth} className="glass rounded-lg p-6 hover:bg-primary/10 transition-all duration-300 group">
                              <div className="text-center space-y-3">
                                <div className="text-lg font-semibold text-primary glow-text">
                                  {zone.depth}
                                </div>
                                <div className="text-sm text-foreground/70 capitalize">
                                  {index === 0 ? 'Sunlight Zone' :
                                   index === 1 ? 'Twilight Zone' :
                                   index === 2 ? 'Midnight Zone' : 'Abyssal Zone'}
                                </div>
                                <div className="space-y-2">
                                  <div className="text-2xl font-bold text-accent group-hover:animate-pulse">
                                    {zone.species}
                                  </div>
                                  <div className="text-xs text-foreground/60">Species Count</div>
                                  <div className="text-lg font-semibold text-orange-400">
                                    {zone.temp}°C
                                  </div>
                                  <div className="text-xs text-foreground/60">Avg Temperature</div>

                                  {/* Species Diversity Indicator */}
                                  <div className="mt-3">
                                    <div className="text-sm font-medium text-green-400">
                                      {index === 0 ? 'High' : index === 1 ? 'Medium' : index === 2 ? 'Low' : 'Very Low'}
                                    </div>
                                    <div className="text-xs text-foreground/60">Biodiversity</div>
                                    <div className="mt-1 h-2 bg-muted rounded-full">
                                      <div
                                        className={`h-full rounded-full ${
                                          index === 0 ? 'bg-green-400 w-4/5' :
                                          index === 1 ? 'bg-yellow-400 w-3/5' :
                                          index === 2 ? 'bg-orange-400 w-2/5' :
                                          'bg-red-400 w-1/5'
                                        }`}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Marine Life Trends */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-accent" />
                          Species Discovery Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={temperatureData.map((item, index) => ({
                            ...item,
                            discoveries: Math.floor(Math.random() * 50) + 10,
                            endangered: Math.floor(Math.random() * 15) + 2
                          }))}>
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="discoveries"
                              stroke="#00FFA3"
                              strokeWidth={3}
                              dot={{ fill: '#00FFA3', strokeWidth: 2, r: 4 }}
                              name="New Discoveries"
                            />
                            <Line
                              type="monotone"
                              dataKey="endangered"
                              stroke="#FF6B9D"
                              strokeWidth={3}
                              dot={{ fill: '#FF6B9D', strokeWidth: 2, r: 4 }}
                              name="Endangered Species"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'correlations' && (
                  <motion.div
                    key="correlations"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <Card className="glass-card">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-accent" />
                          Temperature vs Marine Life Correlation
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFullscreenChart({
                            title: 'Temperature vs Marine Life Correlation',
                            content: (
                              <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart data={scatterData}>
                                  <XAxis dataKey="temp" name="Temperature" unit="°C" />
                                  <YAxis dataKey="species" name="Species Count" />
                                  <ZAxis dataKey="salinity" range={[50, 400]} />
                                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                  <Legend />
                                  <Scatter name="Ocean Data" dataKey="species" fill="#00D4FF" />
                                </ScatterChart>
                              </ResponsiveContainer>
                            )
                          })}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart data={scatterData}>
                            <XAxis
                              dataKey="temp"
                              name="Temperature"
                              unit="°C"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            />
                            <YAxis
                              dataKey="species"
                              name="Species Count"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            />
                            <ZAxis dataKey="salinity" range={[50, 400]} />
                            <Tooltip
                              cursor={{ strokeDasharray: '3 3' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="glass-card p-3 border border-border">
                                      <p className="text-sm font-medium">Ocean Data Point</p>
                                      <p className="text-xs text-muted-foreground">Temperature: {data.temp}°C</p>
                                      <p className="text-xs text-muted-foreground">Species: {data.species}</p>
                                      <p className="text-xs text-muted-foreground">Salinity: {data.salinity}‰</p>
                                      <p className="text-xs text-muted-foreground">pH: {data.ph}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend />
                            <Scatter name="Ocean Data" dataKey="species" fill="#00D4FF" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataVisualization;