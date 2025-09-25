import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { logOut } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const navItems = [
    { name: "Home", path: "/home", icon: Waves },
    { name: "Data Viz", path: "/data-viz", icon: Waves },
    { name: "AI Chat", path: "/ai-chat", icon: Waves },
    // { name: "Ocean Explorer", path: "/ocean-explorer", icon: Waves },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/90 backdrop-blur-xl border-b border-blue-400/20 shadow-2xl" style={{ pointerEvents: 'auto' }}>
      {/* Subtle animated top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link to="/home" className="flex items-center space-x-4 group transition-all duration-300">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-teal-500 p-3 rounded-xl border border-blue-400/40 group-hover:border-blue-300 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                <Waves className="h-6 w-6 text-white group-hover:text-blue-100 transition-colors duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-all duration-300 bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-teal-200">
                FloatChat
              </span>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Ocean Intelligence Platform</div>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl backdrop-blur-sm group overflow-hidden",
                  location.pathname === item.path
                    ? "text-white bg-gradient-to-r from-blue-600/80 to-teal-600/80 border border-blue-400/50 shadow-lg shadow-blue-600/25"
                    : "text-slate-200 hover:text-white hover:bg-black/40 hover:border hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10"
                )}
              >
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent animate-pulse"></div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>

                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="relative ml-4">
                <button
                  className="flex items-center gap-3 text-sm text-slate-200 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/40 hover:bg-black/60 hover:shadow-lg hover:shadow-blue-500/10"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{currentUser?.email?.split('@')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-black/90 backdrop-blur-xl border border-blue-400/30 rounded-xl shadow-2xl z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-blue-400/20">
                      <div className="text-sm text-blue-300 font-medium">Signed in as</div>
                      <div className="text-white font-semibold truncate">{currentUser?.email}</div>
                    </div>

                    {/* Actions */}
                    <div className="py-2">
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-blue-500/10 hover:text-white flex items-center gap-3 transition-all duration-200 group"
                        onClick={async () => {
                          try {
                            await logOut();
                            toast.success('Logged out successfully');
                            setProfileDropdownOpen(false);
                          } catch (error) {
                            toast.error('Failed to log out');
                          }
                        }}
                      >
                        <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-200">
                          <LogOut className="h-3 w-3 text-red-400" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4">
                <Button
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-semibold rounded-xl border border-blue-400/30 hover:border-blue-300 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              </div>
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
                <div className="border-t border-slate-600 pt-4">
                  <div className="px-4 py-2 text-sm text-slate-400">
                    {currentUser?.email}
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2"
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
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
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