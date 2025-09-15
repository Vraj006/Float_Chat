import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Waves, Fish, Anchor, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <motion.div 
      className="min-h-screen ocean-bg relative overflow-hidden"
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
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="container mx-auto text-center z-10">
          {/* Main Hero Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold text-white hero-text tracking-tight">
                FLOATCHAT:
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold text-white hero-text">
                DIVE INTO
              </h2>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
              Explore the underwater world and dive into the ocean's data with our 
              immersive visuals and AI insights.
            </p>

            {/* Hero Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
              <Link to="/data-viz">
                <Button variant="hero" size="lg" className="group">
                  <BarChart3 className="h-5 w-5 group-hover:animate-pulse" />
                  Explore Data
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </Link>
              
              <Link to="/ai-chat">
                <Button variant="hero" size="lg" className="group">
                  <MessageSquare className="h-5 w-5 group-hover:animate-pulse" />
                  AI Chatbot
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-4xl font-bold text-foreground glow-text mb-6">
              Immersive Ocean Experiences
            </h3>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Crafted modules that feel alive—ambient motion, depth, and tactile glass layers
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Aqua Spectra Card */}
            <div className="glass-card rounded-xl p-8 hover:shadow-glow transition-all duration-500 group animate-fade-in-up overflow-hidden relative">
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
                
                <h4 className="text-2xl font-bold text-foreground mb-4 glow-text group-hover:text-primary transition-colors duration-300">
                  Aqua Spectra
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  Animated spectral bars with depth shifts and responsive glows for multi-sensor ocean metrics.
                </p>
                
                <div className="mt-8 h-1.5 bg-gradient-to-r from-primary/50 via-accent to-primary/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>
                
                <Link to="/data-viz" className="mt-6 inline-flex items-center text-primary hover:text-accent transition-colors duration-300 text-sm font-medium">
                  Explore Data
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Echo Dialogue Card */}
            <div className="glass-card rounded-xl p-8 hover:shadow-glow-accent transition-all duration-500 group animate-fade-in-up [animation-delay:200ms] overflow-hidden relative">
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
                
                <h4 className="text-2xl font-bold text-foreground mb-4 glow-text group-hover:text-accent transition-colors duration-300">
                  Echo Dialogue
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  Conversational insights with contextual hints, topic threads, and memory breadcrumbs.
                </p>
                
                <div className="mt-8 h-1.5 bg-gradient-to-r from-accent/50 via-primary-glow to-accent/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>
                
                <Link to="/ai-chat" className="mt-6 inline-flex items-center text-accent hover:text-primary transition-colors duration-300 text-sm font-medium">
                  Chat with AI
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Current Canvas Card */}
            <div className="glass-card rounded-xl p-8 hover:shadow-glow transition-all duration-500 group animate-fade-in-up [animation-delay:400ms] overflow-hidden relative">
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
                
                <h4 className="text-2xl font-bold text-foreground mb-4 glow-text group-hover:text-primary-glow transition-colors duration-300">
                  Current Canvas
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  Hypnotic wave fields and motion vectors to feel currents, swells, and pulsing energy.
                </p>
                
                <div className="mt-8 h-1.5 bg-gradient-to-r from-primary-glow/50 via-primary to-primary-glow/50 rounded-full shadow-glow-sm group-hover:shadow-glow transition-all duration-500"></div>
                
                <Link to="/data-viz" className="mt-6 inline-flex items-center text-primary-glow hover:text-primary transition-colors duration-300 text-sm font-medium">
                  View Currents
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="glass-card rounded-2xl p-12 max-w-4xl mx-auto animate-fade-in-up">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 glow-text">
              Ready to explore deeper?
            </h3>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Jump into real-time visualizations or let the AI guide your curiosity.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/data-viz">
                <Button variant="ocean" size="lg" className="group">
                  Explore Data
                  <BarChart3 className="h-5 w-5 group-hover:animate-pulse" />
                </Button>
              </Link>
              
              <Link to="/ai-chat">
                <Button variant="ocean" size="lg" className="group">
                  Ask the AI
                  <MessageSquare className="h-5 w-5 group-hover:animate-pulse" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;