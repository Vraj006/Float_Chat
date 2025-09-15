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
    { name: "Home", path: "/", icon: Waves },
    { name: "Data Viz", path: "/data-viz", icon: Waves },
    { name: "AI Chat", path: "/ai-chat", icon: Waves },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/30 rounded-full blur-md animate-pulse opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-full border border-white/20">
                <Waves className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg tracking-wide">
              FLOATCHAT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg",
                  location.pathname === item.path
                    ? "text-white bg-white/10 border border-white/20 shadow-lg backdrop-blur-sm"
                    : "text-white/80 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-white/80">
                  <User className="h-4 w-4 inline-block mr-2" />
                  {currentUser?.email?.split('@')[0]}
                </div>
                <Button 
                  variant="ocean" 
                  size="sm" 
                  className="shadow-lg border border-white/20 backdrop-blur-sm"
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
                variant="ocean" 
                size="sm" 
                className="shadow-lg border border-white/20 backdrop-blur-sm"
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
                  variant="ocean" 
                  size="sm" 
                  className="self-start animate-pulse-glow"
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
                  variant="ocean" 
                  size="sm" 
                  className="self-start animate-pulse-glow"
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