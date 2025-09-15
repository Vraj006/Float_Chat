import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, BarChart3, Waves, Fish, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI ocean assistant. I can help you understand ocean data, marine life, and environmental patterns. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  // Track initial mount to avoid scrolling to bottom on first render
  const hasMountedRef = useRef(false);

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

  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = {
        temperature: "Ocean temperature is influenced by several factors including solar radiation, depth, currents, and seasonal changes. Surface waters are generally warmer, while deeper waters remain consistently cold. The thermocline creates distinct temperature layers that affect marine ecosystems.",
        biodiversity: "Marine biodiversity is incredibly rich, with over 230,000 known species in our oceans. Different zones support different life forms - from coral reefs teeming with colorful fish in shallow waters to unique deep-sea creatures adapted to extreme pressure and darkness.",
        depth: "Ocean depth creates distinct zones: the sunlight zone (0-200m) supports most marine life including coral reefs, the twilight zone (200-1000m) where light fades and bioluminescence appears, the midnight zone (1000m+) with specialized deep-sea creatures, and the abyssal zone with extreme adaptations.",
        currents: "Ocean currents are like underwater rivers, driven by wind, temperature differences, and Earth's rotation. They distribute heat globally, affect weather patterns, and create nutrient-rich upwelling zones that support marine food chains.",
        default: "That's a fascinating question about our oceans! The marine environment is incredibly complex and interconnected. Ocean temperatures, currents, and depth all work together to create diverse ecosystems. Would you like me to dive deeper into any specific aspect of ocean science?"
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
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(inputValue);
    setInputValue('');
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(question);
  };

  return (
    <motion.div 
      className="min-h-screen ai-chat-bg relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -bottom-16 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float opacity-30 z-0"></div>
      <div className="absolute -top-32 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-slow opacity-20 z-0"></div>
      <div className="absolute top-1/3 -left-16 w-48 h-48 bg-primary-glow/5 rounded-full blur-2xl animate-pulse-slow opacity-20 z-0"></div>
      
      <Navbar />
      
      <div className="pt-28 px-6 pb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-8 animate-fade-in-up">
            {/* Keep heading explicitly white */}
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              AI Ocean Assistant
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Chat with our intelligent AI to discover insights about ocean data and marine ecosystems
            </p>
          </div>

          <Card className="chat-container h-[70vh] flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                  <Fish className="absolute top-10 left-10 h-6 w-6 text-primary animate-wave" />
                  <Waves className="absolute top-20 right-10 h-4 w-4 text-accent animate-float" />
                  <Anchor className="absolute bottom-20 left-1/4 h-8 w-8 text-primary animate-wave" />
                </div>

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary/20 text-foreground' : 'bg-[rgba(0,30,60,0.6)] border border-primary/30'} rounded-2xl px-4 py-3 relative group`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="text-xs text-foreground/50 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {message.type === 'bot' && (
                        <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start animate-fade-in-up">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-[rgba(0,30,60,0.6)] border border-primary/30 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && (
                <div className="mb-6 animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                    Suggested Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <Sparkles className="h-4 w-4 mr-2 text-accent group-hover:animate-spin" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me about ocean data, marine life, or environmental patterns..."
                    className="glass border-primary/30 focus:border-primary focus:shadow-glow transition-all duration-300 pr-12 py-6 text-foreground placeholder:text-foreground/50"
                    disabled={isTyping}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Waves className="h-4 w-4 text-primary/50 animate-wave" />
                  </div>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="glass-card border-primary/30 hover:bg-primary/20 hover:border-primary hover:shadow-glow disabled:opacity-50 px-6 py-6 group"
                >
                  <Send className="h-4 w-4 group-hover:animate-pulse" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center animate-fade-in-up">
            <Button 
              variant="ocean" 
              size="lg" 
              className="group"
              onClick={() => window.location.href = '/data-viz'}
            >
              <BarChart3 className="h-5 w-5 group-hover:animate-pulse" />
              View Data Visualizations
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIChatbot;