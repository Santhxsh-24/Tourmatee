import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, MapPin, Heart, Calendar, Cloud, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  userLocation?: string;
  userMood?: string;
  onShowRecommendations?: () => void;
  initialMessage?: string;
  onPlanTrip?: (params: { location?: string; mood?: string; days?: number; budget?: number }) => void;
  onOpenFullAssistant?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle, userLocation, userMood, onShowRecommendations, initialMessage, onPlanTrip, onOpenFullAssistant }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey, I'm Tourmate 🙂 Your friendly travel buddy. Tell me your city, mood (happy, romantic, tired...) and what you want (tourist place, food, hotel, emergency) and I'll suggest 1-3 spots.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionCity, setSessionCity] = useState<string | undefined>(undefined);
  const [sessionMood, setSessionMood] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Inject initialMessage as an AI message when provided
  React.useEffect(() => {
    if (initialMessage && isOpen) {
      setMessages(prev => ([...prev, { id: Date.now().toString(), text: initialMessage, isUser: false, timestamp: new Date() }]));
    }
  }, [initialMessage, isOpen]);

  const quickActions = [
    { icon: MapPin, text: 'Tourist spots in my city', action: 'touristSpots' },
    { icon: Heart, text: 'Romantic places', action: 'romanticPlaces' },
    { icon: MapPin, text: 'Good food spots', action: 'foodSpots' },
    { icon: AlertCircle, text: 'Emergency help', action: 'emergencyServices' },
  ];

  // Auto-scroll to the latest message whenever the messages list changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Update session mood if user explicitly mentioned one in this message
    const lower = inputText.toLowerCase();
    const knownMoods = ['happy', 'sad', 'romantic', 'energetic', 'tired', 'bored'];
    const foundMood = knownMoods.find((m) => lower.includes(m));
    if (foundMood) {
      setSessionMood(foundMood);
    }

    // Simulate AI response (Tourmate-style)
    setTimeout(() => {
      const { reply, city: newCity } = generateAIResponse(inputText, sessionCity, sessionMood);
      if (newCity) {
        setSessionCity(newCity);
      }
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, currentCity?: string, currentMood?: string): { reply: string; city?: string } => {
    const input = userInput.toLowerCase();

    // Prefer explicit city names mentioned in the message over any stored userLocation
    const knownCities = ['chennai', 'bangalore', 'bengaluru', 'goa', 'mumbai', 'delhi', 'kodaikanal'];
    const explicitCity = knownCities.find((c) => input.includes(c));

    // Basic extraction of city using "in <city>" as a fallback pattern
    const cityMatch = input.match(/in ([a-zA-Z ]+)/);
    const rawCity = cityMatch ? cityMatch[1].trim() : undefined;
    const city = (explicitCity || rawCity || currentCity || userLocation || '').trim();

    // Mood extraction: prefer what the user typed in this message; otherwise
    // fall back to the session mood, so we don't keep re-asking once the user
    // has already told us how they feel.
    const moods = ['happy', 'sad', 'romantic', 'energetic', 'tired', 'bored'];
    const moodFound = moods.find((m) => input.includes(m));
    const mood = (moodFound || currentMood || '').trim();

    // Type detection
    let type: 'tourist' | 'food' | 'emergency' | 'hotel' = 'tourist';
    let typeFromInput = false;

    // Tourist-type intents
    if (
      input.includes('tourist') ||
      input.includes('tourist place') ||
      input.includes('tourist places') ||
      input.includes('places') ||
      input.includes('spots') ||
      input.includes('spot')
    ) {
      type = 'tourist';
      typeFromInput = true;
    }

    // Food / café intents
    if (input.includes('food') || input.includes('restaurant') || input.includes('eat') || input.includes('cafe')) {
      type = 'food';
      typeFromInput = true;
    }

    // Hotel intents
    if (input.includes('hotel') || input.includes('stay') || input.includes('room')) {
      type = 'hotel';
      typeFromInput = true;
    }

    // Emergency intents
    if (input.includes('emergency') || input.includes('hospital') || input.includes('doctor')) {
      type = 'emergency';
      typeFromInput = true;
    }


    if (!city) {
      return { reply: "Got you 🙂 Which city are you in right now?", city: undefined };
    }

    // Step 1 after city: always ask for mood first
    if (!mood) {
      return { reply: "Nice! You're in " + city + " 🙌 How do you feel — happy, romantic, energetic, or tired?", city };
    }

    // Step 2: ask for type if it wasn't explicitly mentioned
    if (!typeFromInput) {
      return {
        reply: "Cool! In " + city + " and feeling " + mood + ". Do you want tourist places, food, cafés, hotels, or emergency help?",
        city,
      };
    }

    // We already know city, mood, and type; go straight to suggestions for food

    const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
    const moodLabel = mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : '';

    // Simple hard-coded suggestions for a couple of cities
    if (cityLabel.toLowerCase().includes('chennai')) {
      if (type === 'food') {
        return {
          reply:
            "Here are some food spots in " +
            cityLabel +
            " for your " +
            (moodLabel || 'current') +
            " mood:\n\n1) Murugan Idli Shop — soft idlis + filter coffee (⭐4.4)\n2) Sandy's Chocolate Laboratory — dessert vibe, chill hangout (⭐4.3)\n\nWant more food places?",
          city,
        };
      }
      if (type === 'hotel' || type === 'emergency') {
        return {
          reply:
            "In " +
            cityLabel +
            ", try these stays:\n\n1) The Raintree, Anna Salai — comfy stay, good connectivity (⭐4.4)\n2) Taj Club House — central, business + leisure mix (⭐4.5)\n\nWant only budget stays or something fancier?",
          city,
        };
      }
      if (mood && mood.includes('romantic')) {
        return {
          reply:
            "Romantic vibe in " +
            cityLabel +
            ":\n\n1) Besant Nagar Beach — sunset walk + sea breeze (⭐4.5)\n2) Semmozhi Poonga — calm garden date spot (⭐4.4)\n\nWant more romantic places?",
          city,
        };
      }
      return {
        reply:
          "Here are a few places in " +
          cityLabel +
          ":\n\n1) Marina Beach — classic seaside hangout (⭐4.4)\n2) Kapaleeshwarar Temple — heritage + peaceful vibe (⭐4.6)\n3) Express Avenue Mall — shopping + food + movies (⭐4.4)\n\nWant more like this or only tourist spots / only food?",
        city,
      };
    }

    // Goa suggestions
    if (cityLabel.toLowerCase().includes('goa')) {
      if (type === 'food') {
        return {
          reply:
            "Nice food mood in " +
            cityLabel +
            " 😋\n\n1) Vinayak Family Restaurant — fish thali, local Goan flavours (⭐4.6)\n2) Ritz Classic — Goan curry + seafood, casual vibe (⭐4.5)\n\nWant more cafes or more proper restaurants?",
          city,
        };
      }
      if (type === 'hotel' || type === 'emergency') {
        return {
          reply:
            "Stays around " +
            cityLabel +
            ":\n\n1) Santana Beach Resort, Candolim — relaxed, near the beach (⭐4.5)\n2) Taj Exotica Resort & Spa — premium beachside stay (⭐4.6)\n\nWant more budget stays?",
          city,
        };
      }
      if (type === 'tourist') {
        if (mood && mood.includes('romantic')) {
          return {
            reply:
              "For a romantic vibe in " +
              cityLabel +
              " 💕\n\n1) Dona Paula Viewpoint — sea views + breezy evenings (⭐4.4)\n2) Palolem Beach — quieter stretch, sunset walks (⭐4.6)\n\nWant more calm or a bit more party?",
            city,
          };
        }
        return {
          reply:
            "Here are a few easy picks in " +
            cityLabel +
            " 🌴\n\n1) Baga Beach — busy, shacks + nightlife (⭐4.3)\n2) Aguada Fort — views + photos, light walk (⭐4.5)\n3) Anjuna Flea Market — shopping + snacks (⭐4.3)\n\nWant only beaches or also viewpoints?",
          city,
        };
      }
    }

    // Kodaikanal suggestions
    if (cityLabel.toLowerCase().includes('kodaikanal')) {
      if (type === 'food') {
        return {
          reply:
            "Some simple food spots in " +
            cityLabel +
            " 😋\n\n1) Astoria Veg — South Indian meals, homely vibe (⭐4.3)\n2) Cloud Street — pizza + bakes, cozy ambience (⭐4.4)\n\nWant more veg places or cafes?",
          city,
        };
      }
      if (type === 'hotel' || type === 'emergency') {
        return {
          reply:
            "Stays you can look at in " +
            cityLabel +
            ":\n\n1) Kodai Resort Hotel — near Coaker's Walk, garden view (⭐4.5)\n2) The Carlton — lake-facing, more premium stay (⭐4.6)\n\nNeed more budget-friendly options?",
          city,
        };
      }
      if (type === 'tourist') {
        if (mood && mood.includes('romantic')) {
          return {
            reply:
              "Romantic spots around " +
              cityLabel +
              " 💕\n\n1) Coaker's Walk — long view point walk, calm vibe (⭐4.5)\n2) Kodaikanal Lake — pedal boats + evening stroll (⭐4.4)\n\nWant more quiet viewpoints?",
            city,
          };
        }
        return {
          reply:
            "Here are a few easy places in " +
            cityLabel +
            " 🌿\n\n1) Kodaikanal Lake — central spot, boating + walk (⭐4.4)\n2) Bryant Park — garden, flowers, relaxed sit-out (⭐4.3)\n3) Pillar Rocks Viewpoint — dramatic cliffs + photos (⭐4.4)\n\nWant more nature spots?",
          city,
        };
      }
    }

    if (cityLabel.toLowerCase().includes('bangalore') || cityLabel.toLowerCase().includes('bengaluru')) {
      if (type === 'food') {
        return {
          reply:
            "Food mood in " +
            cityLabel +
            ":\n\n1) CTR, Malleshwaram — crispy dosa + old-school vibe (⭐4.6)\n2) Truffles — burgers, casual hangout (⭐4.3)\n\nWant only veg or mixed?",
          city,
        };
      }
      if (type === 'hotel' || type === 'emergency') {
        return {
          reply:
            "Stays around " +
            cityLabel +
            ":\n\n1) Lemon Tree Premier, Ulsoor — business + leisure friendly (⭐4.4)\n2) JW Marriott, UB City — premium stay next to nightlife (⭐4.6)\n\nWant more budget options?",
          city,
        };
      }
      if (mood && mood.includes('romantic')) {
        return {
          reply:
            "Romantic mood in " +
            cityLabel +
            ":\n\n1) Sankey Tank — lakeside walk, calm corners (⭐4.4)\n2) Skyye, UB City — rooftop city views, night vibe (⭐4.3)\n\nWant more chill or more party?",
          city,
        };
      }
      return {
        reply:
          "Nice, here are a few picks in " +
          cityLabel +
          ":\n\n1) Lalbagh Botanical Garden — greenery + walks (⭐4.5)\n2) Cubbon Park — open space, relaxed vibe (⭐4.6)\n3) UB City — cafes + luxury ambience (⭐4.5)\n\nWant only tourist spots or only food places?",
        city,
      };
    }

    // Generic fallback for other cities
    if (!mood) {
      return {
        reply:
          "Got it! You're in " +
          cityLabel +
          ". Tell me your vibe (happy, romantic, energetic, tired) and what you want – tourist place, food, hotel or emergency?",
        city,
      };
    }

    // When we know city + mood but don't have specific places, send a short friendly generic answer
    return {
      reply:
        "Based on your " +
        (moodLabel || 'current') +
        " mood in " +
        cityLabel +
        ", try a couple of chill spots: \n\n1) Main town area — walk around, street food, easy vibe (⭐4.2)\n2) Nearby viewpoint / lake — simple nature break (⭐4.3)\n\nWant more like this or only food / only hotels?",
      city,
    };
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      touristSpots: 'Sure :) Tell me your city and mood, I will suggest 2-3 tourist spots.',
      // ... rest of your code remains the same ...
      foodSpots: 'Hungry mood! Which city and any preference – veg, non-veg, cafe?',
      emergencyServices: 'Okay, for emergency help please tell me your city so I can suggest nearby hospitals / important spots.'
    };

    const message: Message = {
      id: Date.now().toString(),
      text: actionMessages[action] || 'How can I help you with that?',
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-500 to-coral-500 rounded-full shadow-floating flex items-center justify-center text-white z-50 ${
          isOpen ? 'hidden' : 'block'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircle className="w-8 h-8" />
      </motion.button>

      {/* AI Assistant Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-md rounded-3xl shadow-floating border border-white/20 z-50 flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-coral-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Tourmate – Travel Buddy</h3>
                  <p className="text-xs text-gray-500">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onOpenFullAssistant && (
                  <motion.button
                    onClick={onOpenFullAssistant}
                    className="px-2 py-1 text-[10px] rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Open full AI
                  </motion.button>
                )}
                <motion.button
                  onClick={onToggle}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 p-2 text-xs bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <action.icon className="w-4 h-4 text-primary-600" />
                    <span className="text-gray-700">{action.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="p-2 bg-gradient-to-r from-primary-500 to-coral-500 text-white rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;

