import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Satellite, Navigation, Globe, BarChart3, Activity, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SimpleMap from "@/components/SimpleMap";

const OceanMapSimple = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden"
    >
      <div className="container mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg">
                  <Satellite className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Argo & BGC-Argo Network
                </h1>
                <div className="p-3 bg-gradient-to-r from-accent to-primary rounded-full shadow-lg">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Interactive satellite view of oceanographic floats across the Indian Ocean
              </p>
            </div>
            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Button>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">6</span>
              </div>
              <p className="text-sm text-muted-foreground">Argo Floats</p>
            </div>
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-4 border border-accent/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold text-accent">4</span>
              </div>
              <p className="text-sm text-muted-foreground">BGC Floats</p>
            </div>
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">10</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Active</p>
            </div>
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-4 border border-accent/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold text-accent">Active</span>
              </div>
              <p className="text-sm text-muted-foreground">Network Status</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <Card className="h-[650px] bg-card/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Map Area
                  </span>
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Real-time satellite view of Argo and BGC-Argo floats in the Indian Ocean
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-full">
                <div className="relative h-[520px] rounded-xl overflow-hidden shadow-inner">
                  <SimpleMap height="100%" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  Float Types
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                      <span className="font-semibold text-primary">Core Argo</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Temperature, Salinity, Pressure profiles
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-accent/20 border border-accent/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">B</div>
                      <span className="font-semibold text-accent">BGC-Argo</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Biogeochemical sensors (O₂, pH, Nitrate, Chlorophyll)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Technical Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded bg-primary/5">
                    <span className="text-sm text-muted-foreground">Max Depth</span>
                    <span className="font-semibold text-primary">2000m</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-accent/5">
                    <span className="text-sm text-muted-foreground">Cycle Period</span>
                    <span className="font-semibold text-accent">10 days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-primary/5">
                    <span className="text-sm text-muted-foreground">Update Frequency</span>
                    <span className="font-semibold text-primary">Real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OceanMapSimple;