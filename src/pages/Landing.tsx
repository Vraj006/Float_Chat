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
      {/* Background Image with Parallax */}
      <div 
        className="fixed inset-0 z-0 parallax"
        style={{
          backgroundImage: `url('https://harmless-tapir-303.convex.cloud/api/storage/ea0474f4-bac1-4388-9783-c0a428aa480a')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/40 to-cyan-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/20 to-transparent" />
      </div>

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
        <section className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 font-serif uppercase text-slate-100">
                FloatChat:
              </h1>

              <h2 className="text-3xl md:text-5xl font-bold mb-8 font-serif uppercase text-slate-200">
                Dive Into
              </h2>
              
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Explore the underwater world and dive into the ocean&apos;s data with our immersive
                visuals and AI insights.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link to="/data">
                <Button
                  size="lg"
                  className="group glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 px-8 py-4 text-lg font-semibold min-w-[250px]"
                >
                  <BarChart3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Explore Data Visualization
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="group glass border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-300 px-8 py-4 text-lg font-semibold min-w-[250px]"
                >
                  <MessageCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  AI Ocean Chatbot
                  <Sparkles className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
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
              <h3 className="text-4xl font-bold text-white mb-4 text-glow">
                Immersive Ocean Experience
              </h3>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Powered by advanced AI and stunning visualizations
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Data Visualization",
                  description: "Interactive charts and graphs revealing ocean patterns, temperature changes, and marine life distributions.",
                  image: "https://harmless-tapir-303.convex.cloud/api/storage/58242cde-844c-46c3-9a32-f1e7359b95d2"
                },
                {
                  icon: MessageCircle,
                  title: "AI Assistant",
                  description: "Chat with our intelligent AI to get insights about ocean data, marine biology, and environmental trends.",
                  image: "https://harmless-tapir-303.convex.cloud/api/storage/47639221-4913-42a5-856a-a3427887a39a"
                },
                {
                  icon: Waves,
                  title: "Real-time Updates",
                  description: "Live data feeds from ocean sensors, satellite imagery, and research stations worldwide.",
                  image: "https://harmless-tapir-303.convex.cloud/api/storage/344f538c-088f-4846-b2a2-831a9cb461b5"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group"
                >
                  <Card className="glass-dark border-white/20 p-8 h-full hover:glow transition-all duration-500 overflow-hidden relative">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        backgroundImage: `url('${feature.image}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h4 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-glow transition-all duration-300">
                        {feature.title}
                      </h4>
                      
                      <p className="text-white/70 text-center leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card className="glass-dark border-cyan-400/30 p-12 glow">
              <h3 className="text-4xl font-bold text-white mb-6 text-glow">
                Ready to Explore?
              </h3>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of researchers, students, and ocean enthusiasts 
                discovering the secrets of our blue planet.
              </p>
              
              {!isAuthenticated ? (
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 px-12 py-4 text-lg font-semibold"
                  >
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/data">
                    <Button
                      size="lg"
                      className="glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 px-8 py-4 text-lg font-semibold"
                    >
                      View Data Dashboard
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20 px-8 py-4 text-lg font-semibold"
                    >
                      Chat with AI
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}