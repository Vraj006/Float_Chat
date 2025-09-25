import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Waves, Fish, Anchor, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Hyperspeed from "@/components/Hyperspeed";

const Landing = () => {
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
        <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Argo Float 3D Model */}
        <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-16 z-[100]" style={{ top: '100px' }}>
          <motion.div
            className="w-full max-w-md lg:max-w-sm relative z-[110]"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {/* Model Container with Title */}
            <div className="relative rounded-xl overflow-hidden border border-blue-400/30 shadow-lg backdrop-blur-sm bg-black/30">
              {/* Enhanced Professional Header */}
              <div className="px-4 py-4 border-b border-blue-400/20 bg-gradient-to-r from-slate-800/60 to-blue-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-teal-600/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                      <Anchor className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Argo Float</h3>
                      <p className="text-blue-300 text-xs font-medium">Ocean Sensor Network</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-md border border-emerald-400/20 backdrop-blur-sm">
                      <span className="text-xs font-mono uppercase tracking-wider">LIVE</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* 3D Model */}
              <iframe
                title="Argo Float 3D Model"
                src="https://sketchfab.com/models/439474c830744c95b48dc90cfff6fdbe/embed?autostart=1&controls=1&transparent=1&ui_watermark=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_hint=0&ui_ar=0&ui_settings=0&ui_fullscreen=0&ui_theatre=0&wireframe=0"
                width="100%"
                height="320"
                frameBorder="0"
                allowFullScreen
                className="relative z-[200]"
                style={{
                  pointerEvents: 'auto',
                  isolation: 'isolate'
                }}
              />
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
              {/* Neon glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>

              <motion.h1
                className="relative text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <span className="bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl shadow-blue-500/50">
                  Float
                </span>
                <span className="bg-gradient-to-br from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-2xl shadow-teal-500/50">
                  Chat
                </span>
              </motion.h1>

              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Real-Time Ocean Intelligence
              </motion.h2>

              {/* Ocean decorative line */}
              <div className="absolute -bottom-2 left-0 lg:left-0 lg:w-48 w-32 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-transparent rounded-full shadow-lg shadow-blue-500/50"></div>
            </div>

            {/* Enhanced Description */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl lg:mx-0 mx-auto leading-relaxed">
                Advanced oceanographic monitoring platform delivering real-time insights
                from autonomous float sensors with AI-powered analysis and visualization.
              </p>

              {/* Professional Feature highlights */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30 shadow-lg shadow-blue-500/20">
                  <span className="text-sm text-blue-400 font-medium">🌊 24/7 Monitoring</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-500/30 shadow-lg shadow-teal-500/20">
                  <span className="text-sm text-teal-400 font-medium">🤖 AI Powered</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                  <span className="text-sm text-emerald-400 font-medium">📊 Real-time Data</span>
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
                <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-400 border-2 border-blue-400/50 hover:border-blue-300 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-blue-500/30 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center space-x-2">
                    <Anchor className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Ocean Explorer</span>
                  </div>
                </Button>
              </Link>

              <Link to="/data-viz">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-teal-600/80 to-teal-500/80 hover:from-teal-500 hover:to-teal-400 border-2 border-teal-400/50 hover:border-teal-300 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-teal-500/30 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Data Analytics</span>
                  </div>
                </Button>
              </Link>

              <Link to="/ai-chat">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 hover:from-emerald-500 hover:to-emerald-400 border-2 border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 px-8 py-3 text-white shadow-xl hover:shadow-emerald-500/30 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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
        {/* Ocean-tech grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 98%, rgba(59, 130, 246, 0.1) 100%),
              linear-gradient(180deg, transparent 98%, rgba(20, 184, 166, 0.1) 100%)
            `,
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Enhanced ocean-tech title */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
              <h3 className="relative text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                OCEAN INTELLIGENCE MATRIX
              </h3>
              {/* Wave effect bars */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500 opacity-60 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Advanced deep-sea monitoring platform with AI-powered marine data analysis
            </p>
          </motion.div>

          {/* Enhanced Ocean Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Data Visualization Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl h-[420px] flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Ocean-tech border and background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-black to-teal-600/10 rounded-2xl"></div>
              <div className="absolute inset-0 border-2 border-blue-400/20 rounded-2xl group-hover:border-blue-400/40 transition-all duration-500"></div>

              {/* Animated wave lines */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-teal-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>

              {/* Card content */}
              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-400/10 flex-1 flex flex-col">
                {/* Header with status indicators */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                      <BarChart3 className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                    </div>
                    {/* Pulse indicator */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-black"></div>
                  </div>

                  {/* Status badge */}
                  <div className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-lg border border-blue-400/20 backdrop-blur-sm">
                    <span className="text-xs font-mono uppercase tracking-wider">LIVE</span>
                  </div>
                </div>

                {/* Title and description */}
                <h4 className="text-xl font-bold text-blue-300 mb-3 font-mono">
                  OCEAN_ANALYTICS.sys
                </h4>
                <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                  Real-time oceanographic data visualization with advanced marine pattern analysis and predictive modeling
                </p>

                {/* Progress bar */}
                <div className="mb-6 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between text-xs text-blue-400 mb-2">
                    <span>Data Flow</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full animate-pulse" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-auto">
                  <Link to="/data-viz">
                    <button className="w-full bg-gradient-to-r from-blue-600/80 to-teal-500/80 hover:from-blue-500 hover:to-teal-400 text-white py-3 px-6 rounded-lg border border-blue-400/30 font-mono text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
                      <span className="flex items-center justify-center">
                        VIEW_ANALYTICS
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-400/40"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-teal-400/40"></div>
            </motion.div>

            {/* AI Assistant Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl h-[420px] flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Ocean-tech border and background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-black to-emerald-500/10 rounded-2xl"></div>
              <div className="absolute inset-0 border-2 border-teal-400/20 rounded-2xl group-hover:border-teal-400/40 transition-all duration-500"></div>

              {/* Animated wave lines */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-emerald-400 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-teal-400/50 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Card content */}
              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-teal-400/10 flex-1 flex flex-col">
                {/* Header with status indicators */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-teal-400/30 group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-all duration-300">
                      <MessageSquare className="h-8 w-8 text-teal-400 group-hover:text-teal-300 transition-colors duration-300" />
                    </div>
                    {/* AI indicator */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-black"></div>
                  </div>

                  {/* Status badge */}
                  <div className="bg-teal-500/10 text-teal-300 px-4 py-2 rounded-lg border border-teal-400/20 backdrop-blur-sm">
                    <span className="text-xs font-mono uppercase tracking-wider">AI</span>
                  </div>
                </div>

                {/* Title and description */}
                <h4 className="text-xl font-bold text-teal-300 mb-3 font-mono">
                  MARINE_AI.chat
                </h4>
                <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                  Intelligent marine assistant with deep oceanographic knowledge and environmental analysis capabilities
                </p>

                {/* Neural activity indicator */}
                <div className="mb-6 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between text-xs text-teal-400 mb-2">
                    <span>AI Response</span>
                    <span>98%</span>
                  </div>
                  <div className="flex space-x-1 h-8">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`flex-1 rounded-full animate-pulse`}
                           style={{
                             backgroundColor: `rgb(20, 184, 166, ${0.3 + (i * 0.07)})`,
                             animationDelay: `${i * 0.1}s`,
                             height: `${20 + (i % 3) * 10}px`
                           }}></div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-auto">
                  <Link to="/ai-chat">
                    <button className="w-full bg-gradient-to-r from-teal-600/80 to-emerald-500/80 hover:from-teal-500 hover:to-emerald-400 text-white py-3 px-6 rounded-lg border border-teal-400/30 font-mono text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 group">
                      <span className="flex items-center justify-center">
                        START_CHAT
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-teal-400/40"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-400/40"></div>
            </motion.div>

            {/* Ocean Explorer Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl h-[420px] flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Ocean-tech border and background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 via-black to-blue-600/10 rounded-2xl"></div>
              <div className="absolute inset-0 border-2 border-slate-400/20 rounded-2xl group-hover:border-slate-400/40 transition-all duration-500"></div>

              {/* Animated wave lines */}
              <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-slate-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute left-0 bottom-0 h-full w-px bg-gradient-to-t from-transparent via-slate-400/50 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Card content */}
              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-400/10 flex-1 flex flex-col">
                {/* Header with status indicators */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-slate-400/30 group-hover:shadow-lg group-hover:shadow-slate-500/20 transition-all duration-300">
                      <Waves className="h-8 w-8 text-slate-400 group-hover:text-slate-300 transition-colors duration-300 animate-pulse" />
                    </div>
                    {/* Flow indicator */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse border-2 border-black"></div>
                  </div>

                  {/* Status badge */}
                  <div className="bg-slate-500/10 text-slate-300 px-4 py-2 rounded-lg border border-slate-400/20 backdrop-blur-sm">
                    <span className="text-xs font-mono uppercase tracking-wider">3D</span>
                  </div>
                </div>

                {/* Title and description */}
                <h4 className="text-xl font-bold text-slate-300 mb-3 font-mono">
                  OCEAN_EXPLORER.3d
                </h4>
                <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                  Interactive 3D ocean environment with real-time current patterns and marine ecosystem visualization
                </p>

                {/* Wave activity indicator */}
                <div className="mb-6 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Current Flow</span>
                    <span>Active</span>
                  </div>
                  <div className="h-8 bg-slate-800 rounded-lg overflow-hidden flex items-end space-x-1 px-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-slate-600 to-blue-500 rounded-t animate-bounce"
                           style={{
                             height: `${20 + Math.sin(i) * 15}px`,
                             animationDelay: `${i * 0.2}s`,
                             animationDuration: '2s'
                           }}></div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-auto">
                  <Link to="/ocean-explorer">
                    <button className="w-full bg-gradient-to-r from-slate-600/80 to-blue-600/80 hover:from-slate-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg border border-slate-400/30 font-mono text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/20 group">
                      <span className="flex items-center justify-center">
                        EXPLORE_OCEAN
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-400/40"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-400/40"></div>
            </motion.div>
          </div>
        </div>
      </section>

      </div>
    </motion.div>
  );
};

export default Landing;