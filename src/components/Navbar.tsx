import { motion } from "framer-motion";
import { Waves, BarChart3, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();

  const navItems = [
    { name: "Home", path: "/", icon: Waves },
    { name: "Data Viz", path: "/data", icon: BarChart3 },
    { name: "AI Chat", path: "/chat", icon: MessageCircle },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-b from-black/30 to-transparent border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Elevated glass bar */}
        <div className="mt-2 mb-2 rounded-2xl border border-cyan-300/20 bg-white/5 backdrop-saturate-150 ring-1 ring-cyan-400/10">
          <div className="flex items-center justify-between h-14 px-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-inner ring-1 ring-white/10 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Waves className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-black tracking-wide font-serif uppercase bg-gradient-to-r from-cyan-200 to-sky-200 bg-clip-text text-transparent drop-shadow">
                FloatChat
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "text-cyan-200 bg-white/10 ring-1 ring-cyan-300/30 shadow-[inset_0_0_0_1px_rgba(0,255,255,0.12)]"
                          : "text-white/85 hover:text-cyan-200 hover:bg-white/10 hover:ring-1 hover:ring-white/15"
                      }`}
                      data-active={isActive}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white/85">{user?.name || user?.email || "User"}</span>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    size="sm"
                    className="glass border-white/20 text-white hover:bg-white/20 rounded-full px-4"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15 rounded-full px-4"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {/* Bottom animated accent line */}
          <div className="h-1 rounded-b-2xl bg-gradient-to-r from-cyan-400/20 via-sky-400/30 to-blue-500/20" />
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-3 pb-5 rounded-b-2xl bg-white/5"
          >
            <div className="flex flex-col space-y-2 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <div
                      className={`flex items-center space-x-3 px-3 py-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-white/20 text-cyan-300"
                          : "text-white/85 hover:text-cyan-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-white/10">
                {isAuthenticated ? (
                  <Button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full glass border-white/20 text-white hover:bg-white/20 rounded-full"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15 rounded-full"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}