import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageCircle, Waves, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Bubbles Animation */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full bubble"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 pt-32 md:pt-40">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-10 md:mb-14"
            >
              {/* Left-aligned, high-contrast serif headings */}
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2 font-serif uppercase text-slate-100 text-left">
                FloatChat:
              </h1>

              <h2 className="text-4xl md:text-6xl font-bold mb-6 font-serif uppercase text-cyan-100/95 text-left">
                Dive Into
              </h2>
              
              {/* Increase contrast + glow to avoid merging with background */}
              <p className="text-lg md:text-2xl text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] max-w-3xl leading-relaxed text-left">
                Explore the underwater world and dive into the ocean&apos;s data with our immersive
                visuals and AI insights.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start mb-16"
            >
              <Link to="/data">
                <Button
                  size="lg"
                  className="group glass glow bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full tracking-tight hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400/60 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <BarChart3 className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  Explore Data
                  <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="group glass border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15 px-10 py-4 text-lg font-semibold rounded-full tracking-tight transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400/60 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,255,255,0.15),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MessageCircle className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  AI Chatbot
                  <Sparkles className="w-5 h-5 ml-3 transition-transform group-hover:rotate-12" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section (unique, no photos) */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h3 className="text-4xl font-bold text-white mb-3 text-glow">
                Immersive Ocean Experiences
              </h3>
              <p className="text-white/80 max-w-2xl mx-auto">
                Crafted modules that feel alive—ambient motion, depth, and tactile glass layers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  badge: "Live",
                  title: "Aqua Spectra",
                  description:
                    "Animated spectral bars with depth shifts and responsive glows for multi-sensor ocean metrics.",
                  accent: "from-cyan-400 via-blue-500 to-violet-500",
                },
                {
                  icon: MessageCircle,
                  badge: "AI",
                  title: "Echo Dialogue",
                  description:
                    "Conversational insights with contextual hints, topic threads, and memory breadcrumbs.",
                  accent: "from-emerald-400 via-teal-400 to-cyan-400",
                },
                {
                  icon: Waves,
                  badge: "Flow",
                  title: "Current Canvas",
                  description:
                    "Hypnotic wave fields and motion vectors to feel currents, swells, and pulsing energy.",
                  accent: "from-indigo-400 via-sky-500 to-cyan-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden glass-dark border-white/15 p-8 h-full transition-all duration-300 rounded-2xl">
                    {/* Decorative gradient blobs */}
                    <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-cyan-400/25 to-blue-600/25 blur-2xl rounded-full group-hover:scale-110 transition-transform" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-white/10 to-cyan-400/10 blur-2xl rounded-full group-hover:scale-110 transition-transform" />

                    {/* Corner badge */}
                    <span className="absolute top-4 left-4 z-10 text-xs px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 backdrop-blur-sm">
                      {feature.badge}
                    </span>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center ring-2 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>

                      <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-glow transition-all duration-300">
                        {feature.title}
                      </h4>

                      <p className="text-white/80 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Accent ribbon */}
                      <div className={`mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r ${feature.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Restored/Added section: minimal CTA band */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="glass-dark border-white/15 p-6 md:p-8 rounded-2xl relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 right-10 w-64 h-64 bg-gradient-to-br from-cyan-500/15 to-blue-600/15 blur-3xl rounded-full" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-center md:text-left">
                  <h5 className="text-2xl font-bold text-white mb-1">
                    Ready to explore deeper?
                  </h5>
                  <p className="text-white/75">
                    Jump into real-time visualizations or let the AI guide your curiosity.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/data">
                    <Button className="glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                      Explore Data
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="glass border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15">
                      Ask the AI
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}