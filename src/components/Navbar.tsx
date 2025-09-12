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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-gradient-to-b from-black/25 to-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top bar — minimal row without boxed container */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
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
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                    className={`nav-link relative flex items-center space-x-2 px-2 py-1 transition-all duration-300 ${
                      isActive ? "text-cyan-200" : "text-white/90 hover:text-cyan-200"
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
                <span className="text-sm text-white/90">
                  {user?.name || user?.email || "User"}
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-white/20 text-white/90 hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 bg-transparent border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15"
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
              className="text-white hover:bg-white/10 rounded-full"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 py-3 pb-5 bg-black/30"
        >
          <div className="flex flex-col space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                  <div
                    className={`flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 text-cyan-300"
                        : "text-white/90 hover:text-cyan-300 hover:bg-white/5"
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
                  className="w-full border-white/20 text-white/90 hover:bg-white/10 rounded-full"
                >
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full bg-transparent border-cyan-300/60 text-cyan-100 hover:text-cyan-50 hover:bg-cyan-400/15"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}