import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  TrendingUp,
  Globe,
  BarChart3,
  Zap,
  Shield,
  Users,
  Database,
  Code,
  BookOpen,
  ArrowRight,
  Copy,
  ExternalLink,
  DollarSign,
  Target,
  PieChart,
  Activity,
  Building,
  GraduationCap,
  Anchor,
  Waves,
  Package,
  HeadphonesIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Hyperspeed from "@/components/Hyperspeed";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";

const Pricing = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated, loading } = useAuth();

  // Redirect to auth if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Market Analysis Data for Visualizations
  const marketData = {
    tam: { value: 3000, label: "Total Addressable Market ($B)" },
    sam: { value: 5, label: "Serviceable Addressable Market ($B)" },
    som: { value: 50, label: "Serviceable Obtainable Market ($M)" },
    growth: [
      { year: "2024", blueEconomy: 2500, geospatialAI: 47.8, oceanData: 5.1 },
      { year: "2026", blueEconomy: 2800, geospatialAI: 78.2, oceanData: 7.8 },
      { year: "2028", blueEconomy: 3200, geospatialAI: 125.6, oceanData: 12.1 },
      { year: "2030", blueEconomy: 3600, geospatialAI: 201.8, oceanData: 18.9 },
      { year: "2032", blueEconomy: 4200, geospatialAI: 324.5, oceanData: 29.5 },
      { year: "2034", blueEconomy: 4800, geospatialAI: 472.0, oceanData: 45.2 }
    ]
  };

  const competitors = [
    { name: "LGND", funding: "$9M", focus: "Earth Data Vectors" },
    { name: "Danti", funding: "$5M", focus: "Natural Language Search" },
    { name: "Sofar Ocean", revenue: "$18M", focus: "Marine Weather APIs" },
    { name: "Saildrone", funding: "$264M", focus: "Autonomous Vessels" }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  return (
    <motion.div
      className="min-h-screen bg-black relative"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Hyperspeed Animation Background */}
      <Hyperspeed />

      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" style={{ zIndex: 5 }}></div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-6">
          <div className="container mx-auto text-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Enhanced Title */}
              <div className="space-y-4 relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>
                <h1 className="relative text-4xl md:text-6xl font-black tracking-tight">
                  <span className="bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl shadow-blue-500/50">
                    Ocean Intelligence
                  </span>
                  <br />
                  <span className="bg-gradient-to-br from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-2xl shadow-teal-500/50">
                    Market Analysis
                  </span>
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-transparent rounded-full shadow-lg shadow-blue-500/50"></div>
              </div>

              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Pioneering the future of ocean intelligence with AI-powered data analytics
              </p>
            </motion.div>
          </div>
        </section>

        {/* Market Analysis Content */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-8">
                <TabsList className="grid w-full grid-cols-3 bg-slate-900/95 backdrop-blur-xl border-2 border-blue-400/30 rounded-xl p-3 shadow-2xl h-16">
                  <TabsTrigger 
                    value="overview" 
                    className="relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/90 data-[state=active]:to-blue-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 text-gray-300 hover:text-white transition-all duration-300 rounded-lg font-semibold h-12 flex items-center justify-center"
                  >
                    <div className="flex items-center justify-center space-x-2 w-full">
                      <TrendingUp className="h-4 w-4" />
                      <span>Market Overview</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="api" 
                    className="relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600/90 data-[state=active]:to-emerald-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 text-gray-300 hover:text-white transition-all duration-300 rounded-lg font-semibold h-12 flex items-center justify-center"
                  >
                    <div className="flex items-center justify-center space-x-2 w-full">
                      <Database className="h-4 w-4" />
                      <span>API Pricing</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="guide" 
                    className="relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/90 data-[state=active]:to-indigo-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 text-gray-300 hover:text-white transition-all duration-300 rounded-lg font-semibold h-12 flex items-center justify-center"
                  >
                    <div className="flex items-center justify-center space-x-2 w-full">
                      <Code className="h-4 w-4" />
                      <span>Implementation Guide</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Market Overview Tab - Market Analysis + Visualization Graphs */}
              <TabsContent value="overview" className="space-y-8">
                {/* Market Analysis Paragraph - Keep Original Glass Card Style */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-blue-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3" />
                    Market Analysis
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    The blue economy, encompassing sustainable use of ocean resources, represents a $2.5-3 trillion global market. 
                    Maritime industries including shipping, offshore energy, fisheries, and coastal tourism drive significant economic value. 
                    Our FloatChat API serves this vast ecosystem by enabling real-time communication between vessels, ports, and shore-based operations, 
                    facilitating efficient coordination and enhancing safety protocols across maritime operations worldwide.
                  </p>
                </motion.div>

                {/* Market Size Visualization - Use Original Card Style with Visual Charts */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="glass-card border-blue-400/20">
                    <CardHeader className="text-center">
                      <CardTitle className="text-blue-300 flex items-center justify-center">
                        <Globe className="h-5 w-5 mr-2" />
                        TAM
                      </CardTitle>
                      <CardDescription>Total Addressable Market</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">${marketData.tam.value}T</div>
                      <p className="text-sm text-gray-400">Global Blue Economy</p>
                      <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-full animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-teal-400/20">
                    <CardHeader className="text-center">
                      <CardTitle className="text-teal-300 flex items-center justify-center">
                        <Target className="h-5 w-5 mr-2" />
                        SAM
                      </CardTitle>
                      <CardDescription>Serviceable Addressable Market</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">${marketData.sam.value}B</div>
                      <p className="text-sm text-gray-400">Ocean Data Services</p>
                      <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 w-4/5 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-emerald-400/20">
                    <CardHeader className="text-center">
                      <CardTitle className="text-emerald-300 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        SOM
                      </CardTitle>
                      <CardDescription>Serviceable Obtainable Market</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">${marketData.som.value}M</div>
                      <p className="text-sm text-gray-400">Early Revenue Potential</p>
                      <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-3/5 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Growth Projections Visualization Chart */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-blue-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Market Growth Projections (2024-2034)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {marketData.growth.map((year, index) => (
                      <div key={year.year} className="text-center">
                        <div className="text-lg font-bold text-white mb-2">{year.year}</div>
                        <div className="space-y-2">
                          <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                            <div className="text-sm text-blue-300">Blue Economy</div>
                            <div className="text-lg font-semibold text-white">${year.blueEconomy}B</div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" 
                                style={{ width: `${(year.blueEconomy / 5000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="bg-teal-600/20 rounded-lg p-3 border border-teal-500/30">
                            <div className="text-sm text-teal-300">Geospatial AI</div>
                            <div className="text-lg font-semibold text-white">${year.geospatialAI}B</div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" 
                                style={{ width: `${(year.geospatialAI / 500) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="bg-emerald-600/20 rounded-lg p-3 border border-emerald-500/30">
                            <div className="text-sm text-emerald-300">Ocean Data</div>
                            <div className="text-lg font-semibold text-white">${year.oceanData}B</div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" 
                                style={{ width: `${(year.oceanData / 50) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Competitive Landscape Visualization */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-purple-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center">
                    <PieChart className="h-5 w-5 mr-3" />
                    Competitive Landscape
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {competitors.map((competitor, index) => (
                      <Card key={competitor.name} className="glass-card border-slate-600/30">
                        <CardContent className="p-4">
                          <div className="text-lg font-semibold text-white mb-2">{competitor.name}</div>
                          <div className="text-sm text-gray-400 mb-2">{competitor.focus}</div>
                          <div className="text-green-400 font-medium text-sm">
                            {competitor.funding && `Funding: ${competitor.funding}`}
                            {competitor.revenue && `Revenue: ${competitor.revenue}`}
                          </div>
                          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full animate-pulse" style={{ width: `${20 + index * 15}%` }}></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* API Pricing Tab */}
              <TabsContent value="api" className="space-y-8">
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Free Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full"
                  >
                    <Card className="glass-card border-slate-400/30 h-full flex flex-col">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-white">Free</CardTitle>
                        <CardDescription>Perfect for students and researchers</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-white">$0</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <ul className="space-y-3 flex-1">
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            1,000 API calls/month
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Basic ARGO data access
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Community support
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Rate limited queries
                          </li>
                        </ul>
                        <Button className="w-full mt-auto bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600">
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pro Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full"
                  >
                    <Card className="glass-card border-blue-400/40 h-full flex flex-col relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-blue-300">Pro</CardTitle>
                        <CardDescription>For professional researchers and small teams</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-white">$99</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <ul className="space-y-3 flex-1">
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            50,000 API calls/month
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Advanced analytics & insights
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Real-time data streaming
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Priority support
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Custom dashboards
                          </li>
                        </ul>
                        <Button className="w-full mt-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600">
                          Choose Pro
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pro+ Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="h-full"
                  >
                    <Card className="glass-card border-teal-400/40 h-full flex flex-col">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-teal-300">Pro+</CardTitle>
                        <CardDescription>For enterprises and institutions</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-white">$299</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <ul className="space-y-3 flex-1">
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Unlimited API calls
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            AI-powered predictions
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            White-label solutions
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            24/7 dedicated support
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            Custom integrations
                          </li>
                          <li className="flex items-center text-gray-300">
                            <Check className="h-4 w-4 text-green-400 mr-2" />
                            SLA guarantees
                          </li>
                        </ul>
                        <Button className="w-full mt-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500">
                          Contact Sales
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* API Features Comparison */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-blue-400/20 mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
                    <Database className="h-5 w-5 mr-3" />
                    API Features & Endpoints
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Data Access</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="text-gray-300">• Real-time ARGO float data</li>
                        <li className="text-gray-300">• Historical oceanographic records</li>
                        <li className="text-gray-300">• Satellite ocean observations</li>
                        <li className="text-gray-300">• Climate anomaly detection</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Analytics</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="text-gray-300">• Temperature trend analysis</li>
                        <li className="text-gray-300">• Salinity pattern recognition</li>
                        <li className="text-gray-300">• Ocean current predictions</li>
                        <li className="text-gray-300">• Marine ecosystem health</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Visualization</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="text-gray-300">• Interactive 3D ocean maps</li>
                        <li className="text-gray-300">• Depth profile charts</li>
                        <li className="text-gray-300">• Time-series visualizations</li>
                        <li className="text-gray-300">• Geospatial heat maps</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Implementation Guide Tab - No Title */}
              <TabsContent value="guide" className="space-y-8">
                {/* API Authentication */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-blue-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
                    <Shield className="h-5 w-5 mr-3" />
                    API Authentication
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 rounded-lg p-4 border border-slate-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Your API Key</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard("fc_sk_test_1234567890abcdef")}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <code className="text-green-400 font-mono text-sm break-all">
                        fc_sk_test_1234567890abcdef
                      </code>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Include this API key in the Authorization header of all requests.
                    </p>
                  </div>
                </motion.div>

                {/* Quick Start */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-teal-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-teal-300 mb-6 flex items-center">
                    <Code className="h-5 w-5 mr-3" />
                    Quick Start
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">1. Base URL</h4>
                      <div className="bg-black/60 rounded-lg p-4 border border-slate-600/30">
                        <code className="text-blue-400 font-mono text-sm">
                          https://api.floatchat.com/v1
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">2. Example Request</h4>
                      <div className="bg-black/60 rounded-lg p-4 border border-slate-600/30 overflow-x-auto">
                        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
{`curl -X GET "https://api.floatchat.com/v1/argo/data" \\
  -H "Authorization: Bearer fc_sk_test_1234567890abcdef" \\
  -H "Content-Type: application/json" \\
  -d '{
    "region": "indian_ocean",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "parameters": ["temperature", "salinity"]
  }'`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">3. Response Format</h4>
                      <div className="bg-black/60 rounded-lg p-4 border border-slate-600/30 overflow-x-auto">
                        <pre className="text-yellow-400 font-mono text-sm whitespace-pre-wrap">
{`{
  "status": "success",
  "data": {
    "floats": [
      {
        "float_id": "2901234",
        "latitude": -15.5,
        "longitude": 67.8,
        "date": "2024-01-15T10:30:00Z",
        "temperature": 28.5,
        "salinity": 35.2,
        "depth": 10.0
      }
    ],
    "total_records": 1542,
    "query_time": "0.045s"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Available Endpoints */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-emerald-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-emerald-300 mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-3" />
                    Available Endpoints
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">GET /argo/data</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-green-400/50 text-green-400">
                            Live
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Retrieve ARGO float oceanographic data</p>
                      </div>

                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">GET /analytics/trends</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-blue-400/50 text-blue-400">
                            Analytics
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Get temperature and salinity trends</p>
                      </div>

                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">POST /chat/query</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-purple-400/50 text-purple-400">
                            AI
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Natural language ocean data queries</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">GET /visualization/maps</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-teal-400/50 text-teal-400">
                            Viz
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Generate interactive ocean maps</p>
                      </div>

                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">GET /anomalies/detect</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-orange-400/50 text-orange-400">
                            Detection
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Identify ocean temperature anomalies</p>
                      </div>

                      <div className="bg-black/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-green-400 text-sm">GET /predictions/forecast</span>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-indigo-400/50 text-indigo-400">
                            Forecast
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">AI-powered ocean condition forecasts</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* SDKs and Libraries */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-blue-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
                    <BookOpen className="h-5 w-5 mr-3" />
                    SDKs & Libraries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-600/20 rounded-lg p-6 mb-4">
                        <Code className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-white">Python SDK</h4>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" className="flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          pip install floatchat
                        </a>
                      </Button>
                    </div>

                    <div className="text-center">
                      <div className="bg-teal-600/20 rounded-lg p-6 mb-4">
                        <Code className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-white">JavaScript SDK</h4>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" className="flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          npm install @floatchat/sdk
                        </a>
                      </Button>
                    </div>

                    <div className="text-center">
                      <div className="bg-emerald-600/20 rounded-lg p-6 mb-4">
                        <Code className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-white">R Package</h4>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="#" className="flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          install.packages("floatchat")
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Support and Resources */}
                <motion.div
                  className="glass-card rounded-2xl p-8 border border-purple-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    Support & Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Documentation</h4>
                      <ul className="space-y-2">
                        <li>
                          <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            API Reference
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Getting Started Guide
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Code Examples
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Tutorials
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Community</h4>
                      <ul className="space-y-2">
                        <li>
                          <a href="#" className="text-teal-400 hover:text-teal-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Discord Community
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-teal-400 hover:text-teal-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            GitHub Repository
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-teal-400 hover:text-teal-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Stack Overflow
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-teal-400 hover:text-teal-300 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Contact Support
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Pricing;





































