import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, BarChart3, Waves, Fish, Anchor, Mic, MicOff, Upload, X, Download, History, Settings, ChevronDown, TrendingUp, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('general');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [showMainNav, setShowMainNav] = useState(false);
  const [headerTransition, setHeaderTransition] = useState('idle'); // idle, transitioning, active
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasMountedRef = useRef(false);
  const recognitionRef = useRef(null);

  // Sample data for charts
  const tempData = [
    { month: 'Jan', temp: 18.5 }, { month: 'Feb', temp: 19.2 }, { month: 'Mar', temp: 20.1 },
    { month: 'Apr', temp: 21.8 }, { month: 'May', temp: 23.4 }, { month: 'Jun', temp: 25.1 }
  ];

  const speciesData = [
    { depth: '0-50m', count: 342 }, { depth: '50-200m', count: 189 },
    { depth: '200-1000m', count: 67 }, { depth: '1000m+', count: 23 }
  ];

  const suggestedQuestions = [
    "What affects ocean temperature?",
    "Tell me about marine biodiversity",
    "How does depth affect marine life?",
    "Explain ocean current patterns"
  ];

  // Scroll only when new messages are added after initial mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // Skip auto-scroll on initial load
    }
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);
  
  // REMOVED: The useEffect hook below was forcing the scroll to the bottom on initial load.
  /*
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, []);
  */

  // Cleanup voice recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping voice recognition on unmount:', error);
        }
      }
    };
  }, []);

  // Voice recognition functions
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        console.log('Voice recognition ended');
      };

      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        console.log('Voice recognition result:', transcript);
      };

      try {
        recognitionRef.current = recognition;
        recognition.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setIsListening(false);
        recognitionRef.current = null;
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Voice recognition stopped manually');
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    setCurrentTopic(getTopicFromMessage(userMessage));

    setTimeout(() => {
      const responses = {
        temperature: {
          content: "Ocean temperature varies significantly with depth and location. Here's what the data shows:\n\n• **Surface Waters**: 15-30°C depending on latitude\n• **Thermocline**: Rapid temperature drop between 200-1000m\n• **Deep Ocean**: Consistently 2-4°C\n• **Seasonal Variation**: 1-5°C in surface waters\n\nTemperature affects marine life distribution, ocean currents, and weather patterns globally.",
          hasChart: true,
          chartType: 'temperature',
          suggestions: ["Show me temperature by depth", "How does temperature affect marine life?", "What causes ocean warming?"]
        },
        biodiversity: {
          content: "Marine biodiversity is extraordinary! Our oceans host:\n\n🐠 **230,000+ known species** (estimated 2 million total)\n🌊 **Distinct ecosystems** by depth and region\n🦑 **Unique adaptations** for extreme environments\n🪸 **Coral reefs** - most biodiverse marine ecosystems\n\nBiodiversity decreases with depth but increases in complexity.",
          hasChart: true,
          chartType: 'species',
          suggestions: ["Show species by depth zones", "Tell me about coral reef biodiversity", "What threatens marine biodiversity?"]
        },
        depth: {
          content: "Ocean depth creates fascinating ecological zones:\n\n🌅 **Sunlight Zone (0-200m)**: 90% of marine life\n🌙 **Twilight Zone (200-1000m)**: Bioluminescence begins\n🌑 **Midnight Zone (1000-4000m)**: No sunlight, extreme pressure\n🕳️ **Abyssal Zone (4000m+)**: Specialized deep-sea creatures\n\nEach zone has unique adaptations and ecosystems.",
          hasChart: true,
          chartType: 'species',
          suggestions: ["How do animals adapt to deep ocean?", "Show me pressure changes by depth", "What lives in the deepest ocean?"]
        },
        currents: {
          content: "Ocean currents are Earth's circulatory system:\n\n🌊 **Surface Currents**: Driven by winds, affect climate\n🌡️ **Thermohaline Circulation**: Deep currents from temperature/salinity\n🔄 **Global Conveyor Belt**: Distributes heat worldwide\n🐟 **Upwelling**: Brings nutrients to surface, supports food chains\n\nCurrents transport heat, nutrients, and marine life across oceans.",
          hasChart: false,
          suggestions: ["How do currents affect weather?", "Show me major ocean currents", "What is El Niño?"]
        },
        data: {
          content: "Our ocean monitoring system provides real-time data:\n\n📊 **Temperature**: Surface to 2000m depth\n🧪 **Chemical**: pH, salinity, oxygen levels\n🐠 **Biological**: Species counts and distribution\n📡 **Satellite**: Sea surface temperature, currents\n\nData helps us understand climate change and ecosystem health.",
          hasChart: true,
          chartType: 'temperature',
          suggestions: ["Show me current ocean data", "How is data collected?", "What are the latest trends?"]
        },
        default: {
          content: "That's a fascinating question about our oceans! 🌊\n\nThe marine environment is incredibly complex and interconnected. Ocean temperatures, currents, and depth all work together to create diverse ecosystems.\n\n**I can help you explore:**\n• Real-time ocean data and trends\n• Marine life and biodiversity\n• Ocean physics and chemistry\n• Climate change impacts\n\nWhat specific aspect interests you most?",
          hasChart: false,
          suggestions: ["Show me ocean temperature data", "Tell me about marine ecosystems", "How does climate change affect oceans?"]
        }
      };

      let response = responses.default;
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
        response = responses.temperature;
      } else if (lowerMessage.includes('biodiversity') || lowerMessage.includes('species') || lowerMessage.includes('marine life')) {
        response = responses.biodiversity;
      } else if (lowerMessage.includes('depth') || lowerMessage.includes('zone')) {
        response = responses.depth;
      } else if (lowerMessage.includes('current') || lowerMessage.includes('flow')) {
        response = responses.currents;
      } else if (lowerMessage.includes('data') || lowerMessage.includes('chart') || lowerMessage.includes('show')) {
        response = responses.data;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: response.content,
        hasChart: response.hasChart,
        chartType: response.chartType,
        suggestions: response.suggestions,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const getTopicFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('temperature')) return 'temperature';
    if (lowerMessage.includes('species') || lowerMessage.includes('biodiversity')) return 'biodiversity';
    if (lowerMessage.includes('depth')) return 'depth';
    if (lowerMessage.includes('current')) return 'currents';
    return 'general';
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachedFile: attachedFile?.name
    };

    // Trigger header transition on first message (before adding message)
    if (messages.length === 0 && !isChatActive) {
      setHeaderTransition('transitioning');
      setTimeout(() => {
        setIsChatActive(true);
        setHeaderTransition('active');
      }, 300);
    }

    setMessages(prev => [...prev, newMessage]);

    simulateAIResponse(inputValue);
    setInputValue('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Chart component for AI responses
  const AIChart = ({ chartType }) => {
    if (chartType === 'temperature') {
      return (
        <Card className="glass-card mt-4 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Ocean Temperature Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tempData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    if (chartType === 'species') {
      return (
        <Card className="glass-card mt-4 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fish className="h-4 w-4 text-accent" />
              Species Distribution by Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={speciesData}>
                <XAxis dataKey="depth" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#speciesGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="speciesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    // Trigger header transition on first message (before adding message)
    if (messages.length === 0 && !isChatActive) {
      setHeaderTransition('transitioning');
      setTimeout(() => {
        setIsChatActive(true);
        setHeaderTransition('active');
      }, 300);
    }

    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-accent/10 via-accent/5 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-blue-500/5 via-blue-400/3 to-transparent rounded-full blur-xl"></div>
      </div>

      {/* Dynamic Header System */}
      <AnimatePresence mode="wait">
        {!isChatActive ? (
          <motion.div
            key="main-nav"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Navbar />
          </motion.div>
        ) : (
          <motion.div
            key="ai-nav"
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 glass-header-transition"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Enhanced AI Header Brand */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-lg">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      AI Ocean Assistant
                    </h1>
                    <p className="text-xs text-muted-foreground">Real-time marine intelligence</p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center space-x-2">
                  {/* Sidebar Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                  >
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm hidden sm:inline">Chat Info</span>
                  </Button>

                  {/* Main Nav Access Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMainNav(!showMainNav)}
                    className="hidden sm:flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="w-4 h-4 flex flex-col space-y-0.5">
                      <div className="w-full h-0.5 bg-current"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                    <span className="text-sm">Menu</span>
                  </Button>

                  {/* Quick Actions */}
                  <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Chat Status */}
                  <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full status-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Active Chat</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Overlay */}
      <AnimatePresence>
        {showMainNav && isChatActive && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowMainNav(false)}
          >
            <motion.div
              className="fixed top-0 left-0 right-0 bg-background/98 border-b border-border/30 shadow-xl"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Navigation Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMainNav(false)}
                    className="hover:bg-red-500/10 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Home', icon: '🏠', href: '/' },
                    { name: 'Ocean Explorer', icon: '🌊', href: '/ocean-explorer' },
                    { name: 'Data Visualization', icon: '📊', href: '/data-viz' },
                    { name: 'AI Chat', icon: '🤖', href: '/ai-chat', active: true },
                  ].map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.href}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg nav-item-stagger ${
                        item.active
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-card/50 border-border/20 hover:bg-card/80'
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      onClick={() => setShowMainNav(false)}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-medium text-sm">{item.name}</div>
                    </motion.a>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted/20 rounded-xl border border-border/20">
                  <p className="text-sm text-muted-foreground text-center">
                    You're currently in AI Chat mode. The assistant header has replaced the main navigation.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Page Container */}
      <div className={`fixed left-0 right-0 bottom-0 flex flex-col relative z-10 page-transition ${
        isChatActive ? 'top-16 chat-activation' : 'top-20'
      }`}>

        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className={`fixed left-0 bottom-0 w-80 lg:w-80 md:w-72 sm:w-full bg-background/95 backdrop-blur-xl border-r border-border/30 z-40 overflow-hidden shadow-2xl ${
                isChatActive ? 'top-16' : 'top-20'
              }`}
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Chat Session</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="hover:bg-red-500/10 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>


              {/* Enhanced Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Current Session Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground">Current Topic:</span>
                    <span className="font-medium text-foreground capitalize">{currentTopic}</span>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span>Messages</span>
                      <span className="font-medium">{messages.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Session Time</span>
                      <span className="font-medium">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-card/80 to-card/60 border-border/30 shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold mb-3 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>Quick Actions</span>
                    </div>
                    <div className="space-y-2">
                      <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-primary/10 transition-all duration-200 text-xs">
                        <Download className="h-4 w-4 mr-2" />
                        Export Chat
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-accent/10 transition-all duration-200 text-xs">
                        <History className="h-4 w-4 mr-2" />
                        Clear History
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted/20 transition-all duration-200 text-xs">
                        <Settings className="h-4 w-4 mr-2" />
                        AI Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Topics */}
                <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-border/20">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold mb-3 flex items-center space-x-2">
                      <Fish className="h-4 w-4 text-accent" />
                      <span>Explore Topics</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { topic: 'Ocean Temperature', icon: Thermometer, color: 'text-orange-500' },
                        { topic: 'Marine Biodiversity', icon: Fish, color: 'text-accent' },
                        { topic: 'Current Patterns', icon: Waves, color: 'text-primary' },
                        { topic: 'Deep Sea Research', icon: Anchor, color: 'text-blue-500' }
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setInputValue(`Tell me about ${item.topic.toLowerCase()}`);
                            setSidebarOpen(false);
                          }}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background/50 cursor-pointer transition-all w-full text-left group"
                        >
                          <item.icon className={`w-3 h-3 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.topic}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Capabilities */}
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/20">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold mb-3">What I Can Help With</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                        <span>Ocean data analysis & visualization</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-accent rounded-full mt-2"></div>
                        <span>Marine life identification & behavior</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                        <span>Environmental pattern analysis</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-accent rounded-full mt-2"></div>
                        <span>Research insights & trends</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Main Chat Container - Enhanced Full Screen */}
        <div className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ease-in-out ${sidebarOpen ? 'lg:ml-80 md:ml-72 sm:ml-0' : 'ml-0'} relative z-10 pb-20`}>


        {/* Enhanced Chat Messages Area - FIXED SCROLLING */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Floating Marine Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <Fish className="absolute top-1/4 left-12 h-6 w-6 text-primary/20 animate-float" />
            <Waves className="absolute top-1/2 right-16 h-5 w-5 text-accent/20 animate-wave" />
            <Anchor className="absolute bottom-1/3 left-1/4 h-7 w-7 text-primary/15 animate-float" style={{animationDelay: '2s'}} />
            <Fish className="absolute top-2/3 right-1/3 h-4 w-4 text-accent/25 animate-float" style={{animationDelay: '1s'}} />
          </div>

          {/* Messages Container - PROPERLY SCROLLABLE */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10 chat-scroll-container">
            <div className="space-y-4 sm:space-y-6 max-w-none">

            {messages.map((message) => (
              <motion.div
                key={message.id}
                className="flex items-end space-x-3 justify-center"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 ring-accent/10'
                    : 'bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 ring-primary/10'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-6 w-6 text-accent" />
                  ) : (
                    <Bot className="h-6 w-6 text-primary" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[70%] lg:max-w-[60%] relative group message-bubble ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/20'
                    : 'bg-gradient-to-br from-card/90 to-card/70 border border-border/30'
                } rounded-3xl px-6 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm`}>

                  {/* Attached File */}
                  {message.attachedFile && (
                    <div className="mb-4 p-3 bg-muted/30 rounded-2xl text-sm flex items-center space-x-3 border border-border/20">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Upload className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{message.attachedFile}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-base leading-relaxed whitespace-pre-line text-foreground font-medium">
                    {message.content}
                  </div>

                  {/* Chart */}
                  {message.hasChart && message.chartType && (
                    <div className="mt-5">
                      <AIChart chartType={message.chartType} />
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-2xl border border-border/20">
                      <div className="text-sm text-muted-foreground mb-3 font-semibold flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>Continue exploring:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-sm h-auto py-2 px-4 hover:bg-primary/10 hover:border-primary/30 border-border/30 rounded-xl transition-all duration-200 font-medium"
                            onClick={() => handleSuggestedQuestion(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="mt-4 pt-3 border-t border-border/10 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-1">
                        <Sparkles className="h-3 w-3 text-accent animate-pulse" />
                        <span className="text-accent font-semibold">AI</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                className="flex items-end space-x-3 justify-center"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 ring-2 ring-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="bg-gradient-to-br from-card/90 to-card/70 border border-border/30 rounded-3xl px-6 py-4 shadow-xl backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Enhanced Suggested Questions */}
        {messages.length === 0 && (
          <motion.div
            className="flex-shrink-0 border-t border-border/10 p-4 sm:p-6 bg-gradient-to-b from-background/30 to-background/60 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6 text-center flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                </div>
                <span>Explore Ocean Intelligence</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 chat-mobile-grid">
                  {suggestedQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-auto p-4 justify-start text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/40 border-border/30 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Sparkles className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-200" />
                          </div>
                          <span className="text-base font-medium">{question}</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        {/* Enhanced Input Area - FIXED AT BOTTOM */}
        <motion.div
          className="flex-shrink-0 border-t border-border/20 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl fixed bottom-0 left-0 right-0 z-20"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-2 sm:p-3">
            <div className="max-w-3xl mx-auto">
                {/* Attached File Preview */}
                <AnimatePresence>
                  {attachedFile && (
                    <motion.div
                      className="mb-4 p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl border border-border/30 shadow-sm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">{attachedFile.name}</span>
                            <p className="text-xs text-muted-foreground">Ready to analyze</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeAttachedFile}
                          className="h-8 w-8 p-0 hover:bg-red-500/10 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              {/* Input Controls */}
              <div className="flex items-end space-x-2 sm:space-x-3 lg:space-x-4 chat-mobile-controls">
                {/* Main Input */}
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask me about ocean data, marine life, or environmental patterns..."
                    className="min-h-[40px] sm:min-h-[44px] text-sm bg-background/80 border-border/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-10 sm:pr-12 py-2 sm:py-3 px-3 sm:px-4 text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl shadow-lg backdrop-blur-sm resize-none chat-input chat-mobile-input"
                    disabled={isTyping}
                  />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      <Waves className="h-5 w-5 text-primary/40 animate-wave" />
                      {inputValue.trim() && !isTyping && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.csv,.json,.pdf,.png,.jpg,.jpeg"
                    className="hidden"
                  />

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] p-0 rounded-lg border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-md"
                    disabled={isTyping}
                    title="Upload file"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={toggleListening}
                    className={`h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] p-0 rounded-lg transition-all duration-200 shadow-md ${
                      isListening
                        ? 'bg-accent text-accent-foreground border-accent/50 shadow-accent/20'
                        : 'border-border/40 hover:border-accent/50 hover:bg-accent/5'
                    }`}
                    disabled={isTyping}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-[40px] px-3 sm:h-[44px] sm:px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-40 rounded-lg group transition-all duration-300 shadow-md font-medium touch-target"
                    title="Send message"
                  >
                    <Send className="h-4 w-4 mr-1 sm:mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="hidden sm:inline text-sm">Send</span>
                  </Button>
                </div>
                </div>

              {/* Input Stats - Compact */}
              <div className="mt-1 sm:mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-xs">Press Enter to send</span>
                  {isListening && (
                    <div className="flex items-center space-x-1 text-accent">
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-xs">Listening...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">{inputValue.length}/1000</span>
                  <div className="w-4 sm:w-6 h-1 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-200"
                      style={{ width: `${Math.min((inputValue.length / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AIChatbot;