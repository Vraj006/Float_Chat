import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { logOut } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const navItems = [
    { name: "Home", path: "/home", icon: Waves },
    { name: "Data Viz", path: "/data-viz", icon: Waves },
    { name: "AI Chat", path: "/ai-chat", icon: Waves },
    { name: "Ocean Explorer", path: "/ocean-explorer", icon: Waves },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-xl" style={{ pointerEvents: 'auto' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3 group transition-all duration-200">
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-3 rounded-xl border border-blue-400/30 group-hover:border-blue-300 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <Waves className="h-6 w-6 text-white group-hover:text-blue-100 transition-colors duration-300" />
              </div>
            </div>
            <span className="text-xl font-bold text-white text-headline tracking-tight group-hover:text-blue-200 transition-all duration-300">
              FloatChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg",
                  location.pathname === item.path
                    ? "text-white bg-blue-600 border border-blue-500 shadow-lg shadow-blue-600/25"
                    : "text-slate-200 hover:text-white hover:bg-slate-800 hover:border hover:border-slate-600"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-300">
                  <User className="h-4 w-4 inline-block mr-2" />
                  {currentUser?.email?.split('@')[0]}
                </div>
                <Button
                  variant="professional"
                  size="sm"
                  className="transition-all duration-300"
                  onClick={async () => {
                    try {
                      await logOut();
                      toast.success('Logged out successfully');
                    } catch (error) {
                      toast.error('Failed to log out');
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="hero"
                size="sm"
                className="transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary/20">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all duration-300",
                    location.pathname === item.path
                      ? "text-primary glow-text"
                      : "text-foreground/80 hover:text-primary"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button
                  variant="professional"
                  size="sm"
                  className="self-start transition-all duration-300"
                  onClick={async () => {
                    try {
                      await logOut();
                      toast.success('Logged out successfully');
                      setIsOpen(false);
                    } catch (error) {
                      toast.error('Failed to log out');
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="hero"
                  size="sm"
                  className="self-start transition-all duration-300"
                  onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;