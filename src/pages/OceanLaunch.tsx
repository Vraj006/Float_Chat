import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";
import ARVROceanBackground from "@/components/ARVROceanBackground";
import { motion } from "framer-motion";

const OceanLaunch = () => {
  return (
    <motion.div
      className="h-screen w-screen fixed inset-0 overflow-hidden m-0 p-0"
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900" style={{ zIndex: -100 }}></div>

      {/* AR/VR Ocean Background - Full Screen */}
      <ARVROceanBackground className="launch" />

      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-0"></div>

      {/* Ocean Launch Content */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="container mx-auto text-center z-20">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Enhanced FloatChat Title */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.7, type: "spring", bounce: 0.3 }}
            >
              {/* Glow effect behind title */}
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400/30 via-cyan-400/40 to-blue-500/30 animate-pulse-slow"></div>

              <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-br from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
                  Float
                </span>
                <span className="bg-gradient-to-br from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Chat
                </span>
              </h1>

              {/* Floating particles around title */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60 blur-sm"></div>
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce opacity-70 blur-sm" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white rounded-full animate-pulse opacity-50 blur-sm" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-float opacity-80 blur-sm" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Underline effect */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 md:w-64 lg:w-80 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-glow"></div>
            </motion.div>

            {/* Enhanced Subtitle */}
            <motion.p
              className="text-lg md:text-xl lg:text-2xl font-medium bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-200 bg-clip-text text-transparent max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              Dive into the depths of ocean intelligence
            </motion.p>

            {/* Enhanced Ocean-Themed Button */}
            <motion.div
              className="mt-16 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/30 to-cyan-400/20 rounded-2xl blur-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <Link to="/home" className="relative group" aria-label="Navigate to main application">
                <Button
                  className="relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-400/30 border border-cyan-400/30 hover:border-cyan-300/60 backdrop-blur-md px-12 py-4 text-lg font-semibold text-white hover:text-cyan-100 shadow-xl hover:shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 rounded-2xl group focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
                  size="lg"
                  aria-label="Start exploring FloatChat ocean intelligence platform"
                >
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>

                  {/* Ripple effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 transition-all duration-300"></div>

                  {/* Button content */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      className="mr-3"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Waves className="h-5 w-5 text-cyan-300 drop-shadow-sm" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent font-bold tracking-wide drop-shadow-sm">
                      Dive Deep
                    </span>
                  </div>

                  {/* Bottom glow line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-500"></div>
                </Button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default OceanLaunch;