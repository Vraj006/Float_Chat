import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Waves, Fish, Anchor, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/8 via-transparent to-accent/8"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-accent/15 via-accent/8 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-blue-500/10 via-blue-400/5 to-transparent rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/40 rounded-full animate-float blur-sm"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce blur-sm" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-32 w-1 h-1 bg-primary/60 rounded-full animate-float blur-sm" style={{animationDelay: '0.5s'}}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Ocean-Themed 3D Argo Float Container */}
        <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-20 z-[100]" style={{ top: '80px' }}>
          <motion.div
            className="w-full max-w-lg lg:max-w-md relative z-[110]"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {/* Ocean-Themed Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-400/30 shadow-2xl">
              {/* Ocean Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-slate-900/80 backdrop-blur-xl"></div>

              {/* Animated Ocean Waves */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
                <div className="absolute top-4 left-0 w-full h-6 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-8 left-0 w-full h-4 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-cyan-300/60 rounded-full animate-float blur-sm`}
                    style={{
                      top: `${20 + (i * 10)}%`,
                      left: `${10 + (i * 8)}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + (i % 3)}s`
                    }}
                  />
                ))}
              </div>

              {/* 3D Model Container */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Anchor className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Argo Float</h3>
                      <p className="text-cyan-300 text-xs">Deep Ocean Sensor</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>

                {/* 3D Model */}
                <div className="relative rounded-xl overflow-hidden border border-cyan-400/20">
                  <iframe
                    title="Argo Float 3D Model"
                    src="https://sketchfab.com/models/439474c830744c95b48dc90cfff6fdbe/embed?autostart=1&controls=1&transparent=1&ui_watermark=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_hint=0&ui_ar=0&ui_settings=0&ui_fullscreen=0&ui_theatre=0&wireframe=0"
                    width="100%"
                    height="350"
                    frameBorder="0"
                    allowFullScreen
                    className="relative z-[200]"
                    style={{
                      pointerEvents: 'auto',
                      background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
                      isolation: 'isolate'
                    }}
                  />
                </div>

                {/* Ocean Data Panel */}
                <div className="mt-4 bg-gradient-to-r from-slate-800/60 to-blue-900/40 rounded-lg p-4 border border-cyan-400/20 backdrop-blur-sm">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-cyan-300 text-xs font-medium">Depth</div>
                      <div className="text-white text-sm font-bold">2,847m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-300 text-xs font-medium">Temp</div>
                      <div className="text-white text-sm font-bold">4.2°C</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 text-xs font-medium">Status</div>
                      <div className="text-white text-sm font-bold">Active</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Waves className="h-4 w-4 text-cyan-400 animate-wave" />
                      <span className="text-cyan-200 text-xs font-medium">Live Ocean Data</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <div className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Interaction Hint */}
                <div className="mt-3 text-center">
                  <p className="text-cyan-200/80 text-xs">
                    🖱️ Drag to rotate • 🔍 Scroll to zoom • 🖱️ Right-click to pan
                  </p>
                </div>
              </div>

              {/* Bottom Ocean Effect */}
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Hero Content */}
        <div className="container mx-auto text-center z-20 flex flex-col lg:flex-row items-center justify-between" style={{ paddingTop: '80px' }}>
          <motion.div
            className="lg:w-1/2 space-y-10 lg:text-left text-center relative z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Enhanced Title Section */}
            <div className="space-y-6 relative">
              {/* Background glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl"></div>

              <motion.h1
                className="relative text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <span className="bg-gradient-to-br from-white via-primary/90 to-accent/80 bg-clip-text text-transparent drop-shadow-2xl">
                  Float
                </span>
                <span className="bg-gradient-to-br from-accent/80 via-primary/90 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Chat
                </span>
              </motion.h1>

              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Real-Time Ocean Intelligence
              </motion.h2>

              {/* Decorative line */}
              <div className="absolute -bottom-2 left-0 lg:left-0 lg:w-48 w-32 h-1 bg-gradient-to-r from-primary via-accent to-transparent rounded-full"></div>
            </div>

            {/* Enhanced Description */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl lg:mx-0 mx-auto leading-relaxed">
                Advanced oceanographic monitoring platform delivering real-time insights
                from autonomous float sensors with AI-powered analysis and visualization.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="glass-card px-4 py-2 rounded-full border border-primary/20">
                  <span className="text-sm text-primary font-medium">🌊 24/7 Monitoring</span>
                </div>
                <div className="glass-card px-4 py-2 rounded-full border border-accent/20">
                  <span className="text-sm text-accent font-medium">🤖 AI Powered</span>
                </div>
                <div className="glass-card px-4 py-2 rounded-full border border-green-400/20">
                  <span className="text-sm text-green-400 font-medium">📊 Real-time Data</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row lg:justify-start justify-center items-center gap-4 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <Link to="/ocean-explorer">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-primary/25 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center space-x-2">
                    <Anchor className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Ocean Explorer</span>
                  </div>
                </Button>
              </Link>

              <Link to="/data-viz">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent border-2 border-accent/30 hover:border-accent/50 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-accent/25 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Data Analytics</span>
                  </div>
                </Button>
              </Link>

              <Link to="/ai-chat">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-green-500/25 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>AI Assistant</span>
                  </div>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <div className="lg:w-1/2 hidden lg:block"></div>
        </div>

      </section>


      {/* Features Preview Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-headline mb-6 text-foreground">
              Professional Ocean Intelligence
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-body">
              Enterprise-grade oceanographic data collection and analysis platform
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Aqua Spectra Card */}
            <motion.div
              className="glass-card rounded-xl p-8 hover:shadow-glow transition-all duration-300 group overflow-hidden relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30 z-0"></div>
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse-slow"></div>

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-all duration-300 shadow-glow-sm">
                    <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <span className="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium border border-accent/20 shadow-glow-sm">
                    Live
                  </span>
                </div>

                <h4 className="text-xl font-semibold text-foreground mb-3 text-headline group-hover:text-primary transition-colors duration-200">
                  Data Visualization
                </h4>
                <p className="text-muted-foreground leading-relaxed text-body">
                  Real-time oceanographic data visualization with interactive charts and analytical insights.
                </p>

                <div className="mt-8 h-1.5 bg-gradient-to-r from-primary/50 via-accent to-primary/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>

                <Link to="/data-viz" className="mt-6 inline-flex items-center text-primary hover:text-accent transition-colors duration-300 text-sm font-medium">
                  Explore Data
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>

            {/* Echo Dialogue Card */}
            <motion.div
              className="glass-card rounded-xl p-8 hover:shadow-glow-accent transition-all duration-300 group overflow-hidden relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-30 z-0"></div>
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse-slow"></div>

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4 group-hover:bg-accent/30 transition-all duration-300 shadow-glow-sm">
                    <MessageSquare className="h-8 w-8 text-accent animate-pulse" />
                  </div>
                  <span className="inline-block bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 shadow-glow-sm">
                    AI
                  </span>
                </div>

                <h4 className="text-xl font-semibold text-foreground mb-3 text-headline group-hover:text-accent transition-colors duration-200">
                  AI Assistant
                </h4>
                <p className="text-muted-foreground leading-relaxed text-body">
                  Intelligent conversational interface for oceanographic data analysis and insights.
                </p>

                <div className="mt-8 h-1.5 bg-gradient-to-r from-accent/50 via-primary-glow to-accent/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>

                <Link to="/ai-chat" className="mt-6 inline-flex items-center text-accent hover:text-primary transition-colors duration-300 text-sm font-medium">
                  Chat with AI
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>

            {/* Current Canvas Card */}
            <motion.div
              className="glass-card rounded-xl p-8 hover:shadow-glow transition-all duration-300 group overflow-hidden relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-glow/5 to-transparent opacity-30 z-0"></div>
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary-glow/10 rounded-full blur-xl animate-pulse-slow"></div>

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-glow/20 rounded-full mb-4 group-hover:bg-primary-glow/30 transition-all duration-300 shadow-glow-sm">
                    <Waves className="h-8 w-8 text-primary-glow animate-wave" />
                  </div>
                  <span className="inline-block bg-primary-glow/20 text-primary-glow px-4 py-1.5 rounded-full text-sm font-medium border border-primary-glow/20 shadow-glow-sm">
                    Flow
                  </span>
                </div>

                <h4 className="text-xl font-semibold text-foreground mb-3 text-headline group-hover:text-primary transition-colors duration-200">
                  Ocean Explorer
                </h4>
                <p className="text-muted-foreground leading-relaxed text-body">
                  Interactive 3D ocean environment for exploring current patterns and environmental data.
                </p>

                <div className="mt-8 h-1.5 bg-gradient-to-r from-primary-glow/50 via-primary to-primary-glow/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>

                <Link to="/data-viz" className="mt-6 inline-flex items-center text-primary-glow hover:text-primary transition-colors duration-300 text-sm font-medium">
                  View Currents
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            className="glass-card rounded-2xl p-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-headline mb-6 text-foreground">
              Start Your Ocean Intelligence Journey
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-body">
              Access comprehensive oceanographic data analysis and real-time monitoring capabilities.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link to="/data-viz">
                <Button variant="hero" size="lg" className="group">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </Button>
              </Link>

              <Link to="/ocean-explorer">
                <Button variant="premium" size="lg" className="group">
                  <Anchor className="h-5 w-5" />
                  Ocean Explorer
                </Button>
              </Link>

              <Link to="/ai-chat">
                <Button variant="professional" size="lg" className="group">
                  <MessageSquare className="h-5 w-5" />
                  AI Assistant
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;