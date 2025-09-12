import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { Link } from "react-router";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI ocean assistant. I can help you understand ocean data, marine life, and environmental patterns. What would you like to explore today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const responses = [
      "Based on current ocean data, I can see interesting patterns in temperature and marine life distribution. The data shows seasonal variations that affect biodiversity.",
      "Ocean temperatures have been fluctuating between 22-26°C in the monitored regions. This affects marine ecosystems and species migration patterns.",
      "Marine life activity is highest in the sunlight zone (0-25m depth) where most photosynthesis occurs, supporting the ocean food chain.",
      "The data visualization shows correlations between water temperature, depth, and species diversity. Would you like me to explain any specific pattern?",
      "Ocean currents play a crucial role in distributing nutrients and affecting local climates. The data reflects these complex interactions."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestedQuestions = [
    "What affects ocean temperature?",
    "Tell me about marine biodiversity",
    "How does depth affect marine life?",
    "Explain ocean current patterns"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://harmless-tapir-303.convex.cloud/api/storage/83ea3146-cb20-4f37-8bfe-1d4cd72b43e9')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/60 to-cyan-900/80" />
      </div>

      <Navbar />

      <div className="relative z-20 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-4 text-glow">
              AI Ocean Assistant
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Chat with our intelligent AI to discover insights about ocean data and marine ecosystems
            </p>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-dark border-white/20 glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Ocean Intelligence Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages Area */}
                <ScrollArea className="h-96 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                              : 'bg-gradient-to-r from-purple-400 to-pink-500'
                          }`}>
                            {message.sender === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`p-4 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'glass border border-white/20 text-white'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="glass border border-white/20 p-4 rounded-2xl">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me about ocean data, marine life, or environmental patterns..."
                      className="glass border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="glass glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggested Questions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Suggested Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputMessage(question)}
                  className="glass border-white/20 p-3 rounded-lg text-white/80 hover:text-white hover:border-cyan-400/50 transition-all duration-300 text-left"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-cyan-400" />
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link to="/data">
              <Button
                size="lg"
                variant="outline"
                className="glass border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20 px-8 py-4"
              >
                View Data Visualizations
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
