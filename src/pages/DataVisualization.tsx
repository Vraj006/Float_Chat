import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Waves, Fish, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Link } from "react-router";

export default function DataVisualization() {
  const mockData = {
    temperature: [22, 23, 21, 24, 25, 23, 22, 24, 26, 25, 23, 22],
    depth: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
    marineLife: [45, 52, 38, 61, 73, 42, 58, 67, 39, 55, 48, 63]
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://harmless-tapir-303.convex.cloud/api/storage/797e78d2-60ad-4058-9a07-edfdefa31be8')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/50 to-cyan-900/70" />
      </div>

      <Navbar />

      <div className="relative z-20 pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4 text-glow">
              Ocean Data Visualization
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Explore real-time ocean data through interactive visualizations and comprehensive analytics
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Thermometer, title: "Avg Temperature", value: "23.2°C", change: "+1.2°", color: "from-red-400 to-orange-500" },
              { icon: Waves, title: "Wave Height", value: "2.4m", change: "-0.3m", color: "from-blue-400 to-cyan-500" },
              { icon: Fish, title: "Marine Species", value: "1,247", change: "+89", color: "from-green-400 to-emerald-500" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="glass-dark border-white/20 hover:glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                        <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Temperature Chart */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="glass-dark border-white/20 hover:glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    Ocean Temperature Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {mockData.temperature.map((temp, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${(temp / 30) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg flex-1 min-h-[20px] relative group"
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {temp}°C
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between text-white/60 text-sm mt-2">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Marine Life Chart */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="glass-dark border-white/20 hover:glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Fish className="w-5 h-5 text-green-400" />
                    Marine Life Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {mockData.marineLife.map((count, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${(count / 80) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg flex-1 min-h-[20px] relative group"
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between text-white/60 text-sm mt-2">
                    <span>0m</span>
                    <span>110m</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Depth Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Card className="glass-dark border-white/20 hover:glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Ocean Depth Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { depth: "0-25m", zone: "Sunlight Zone", species: 342, temp: "24°C" },
                    { depth: "25-200m", zone: "Twilight Zone", species: 189, temp: "18°C" },
                    { depth: "200-1000m", zone: "Midnight Zone", species: 67, temp: "12°C" },
                    { depth: "1000m+", zone: "Abyssal Zone", species: 23, temp: "4°C" }
                  ].map((zone, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <h4 className="text-cyan-300 font-semibold mb-2">{zone.depth}</h4>
                      <p className="text-white text-sm mb-3">{zone.zone}</p>
                      <div className="space-y-1">
                        <p className="text-white/70 text-xs">Species: <span className="text-green-400">{zone.species}</span></p>
                        <p className="text-white/70 text-xs">Temp: <span className="text-blue-400">{zone.temp}</span></p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 px-8 py-4"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Export Data
              </Button>
              <Link to="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20 px-8 py-4"
                >
                  Ask AI About Data
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
