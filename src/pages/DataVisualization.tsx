import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Thermometer, Waves, Fish, TrendingUp, Activity, Zap, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        waveHeight: Math.max(0, prev.waveHeight + (Math.random() - 0.5) * 0.3),
        species: prev.species + Math.floor((Math.random() - 0.5) * 20),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="min-h-screen data-viz-bg relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated bubbles */}
      <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float opacity-30 z-0"></div>
      <div className="absolute -top-32 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-slow opacity-20 z-0"></div>
      <div className="absolute top-1/3 -right-16 w-48 h-48 bg-primary-glow/5 rounded-full blur-2xl animate-pulse-slow opacity-20 z-0"></div>
      
      <Navbar />
      
      <div className="pt-20 px-6 pb-12">
        <div className="container mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Ocean Data Visualization
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Explore real-time ocean data through interactive visualizations and comprehensive analytics
            </p>
          </div>

          {/* Real-time Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Temperature Card */}
            <Card className="glass-card border-orange-500/30 hover:border-orange-500/60 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">Avg Temperature</CardTitle>
                <Thermometer className="h-4 w-4 text-orange-500 group-hover:animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500 glow-text">
                  {realTimeMetrics.temperature.toFixed(1)}°C
                </div>
                <p className="text-green-400 text-xs flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  +1.2° from last month
                </p>
              </CardContent>
            </Card>

            {/* Wave Height Card */}
            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">Wave Height</CardTitle>
                <Waves className="h-4 w-4 text-primary group-hover:animate-wave" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary glow-text">
                  {realTimeMetrics.waveHeight.toFixed(1)}m
                </div>
                <p className="text-red-400 text-xs flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3" />
                  -0.3m from average
                </p>
              </CardContent>
            </Card>

            {/* Species Count Card */}
            <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">Marine Species</CardTitle>
                <Fish className="h-4 w-4 text-accent group-hover:animate-float" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent glow-text">
                  {realTimeMetrics.species.toLocaleString()}
                </div>
                <p className="text-green-400 text-xs flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  +89 new species found
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Temperature Trends */}
            <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground glow-text flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Ocean Temperature Trends
                  </CardTitle>
                </div>
                <Zap className="h-5 w-5 text-primary animate-pulse" />
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
            <Card className="glass-card border-accent/20 hover:shadow-glow-accent transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground glow-text flex items-center gap-2">
                    <Fish className="h-5 w-5 text-accent" />
                    Marine Life Activity
                  </CardTitle>
                </div>
                <Activity className="h-5 w-5 text-accent animate-pulse" />
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
          <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-500 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground glow-text flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Ocean Depth Analysis
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up">
            <Button variant="ocean" size="lg" className="group">
              <Download className="h-5 w-5 group-hover:animate-pulse" />
              Export Data
            </Button>
            <Button variant="ocean" size="lg" className="group">
              <Share className="h-5 w-5 group-hover:animate-pulse" />
              Ask AI About Data
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataVisualization;