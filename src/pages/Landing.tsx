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
        <section className="flex-1 flex items-center justify-center px-4 pt-28 md:pt-36">
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
              
              <p className="text-lg md:text-2xl text-slate-200/90 max-w-3xl leading-relaxed text-left">
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
                  className="group glass glow bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full tracking-tight hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <BarChart3 className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  Explore Data
                  <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="group glass border-cyan-300/50 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15 px-10 py-4 text-lg font-semibold rounded-full tracking-tight transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <MessageCircle className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  AI Chatbot
                  <Sparkles className="w-5 h-5 ml-3 transition-transform group-hover:rotate-12" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
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
                Ocean Capabilities
              </h3>
              <p className="text-white/70 max-w-2xl mx-auto">
                Real‑time intel, visual depth, and an assistant that learns your curiosity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  badge: "Live",
                  title: "Holographic Viz",
                  description:
                    "Depth-aware, animated bars with contextual tooltips for currents, temps, and salinity.",
                  image:
                    "https://harmless-tapir-303.convex.cloud/api/storage/58242cde-844c-46c3-9a32-f1e7359b95d2",
                },
                {
                  icon: MessageCircle,
                  badge: "AI",
                  title: "Conversational Insights",
                  description:
                    "Ask anything—get summaries, correlations, and plain‑English explanations.",
                  image:
                    "https://harmless-tapir-303.convex.cloud/api/storage/47639221-4913-42a5-856a-a3427887a39a",
                },
                {
                  icon: Waves,
                  badge: "Now",
                  title: "Sensor Streams",
                  description:
                    "Incoming buoy, satellite, and station data blended to keep you current.",
                  image:
                    "https://harmless-tapir-303.convex.cloud/api/storage/344f538c-088f-4846-b2a2-831a9cb461b5",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.04, y: -8 }}
                  className="group"
                >
                  <Card className="glass-dark border-white/15 p-8 h-full hover:glow transition-all duration-500 overflow-hidden relative rounded-2xl">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        backgroundImage: `url('${feature.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    {/* Corner badge */}
                    <span className="absolute top-4 left-4 z-10 text-xs px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 backdrop-blur-sm">
                      {feature.badge}
                    </span>

                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center ring-2 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>

                      <h4 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-glow transition-all duration-300">
                        {feature.title}
                      </h4>

                      <p className="text-white/75 text-center leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}