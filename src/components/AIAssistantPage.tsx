import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MapPin, Clock, ListChecks, History, Sparkles, Send } from 'lucide-react';

interface AIAssistantPageProps {
  onNavigate: (page: string) => void;
  userLocation: string;
  userMood: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate, userLocation, userMood }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'planner' | 'history'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hi! I'm your AI travel companion. You're in ${userLocation || 'your current city'} and feeling ${
        userMood || 'curious'
      }. Tell me your city, mood, and whether you want tourist places or food spots, and I'll suggest a few options.`,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');

  const TOURIST_API_URL = '/api/denodo/server/tourmate_api/tourist_api/views/v_tourist_places_api';
  const FOOD_API_URL = '/api/denodo/server/tourmate_api/food_api/views/v_food_spots_api';

  const DENODO_USERNAME = import.meta.env.VITE_DENODO_USERNAME || '';
  const DENODO_PASSWORD = import.meta.env.VITE_DENODO_PASSWORD || '';

  const extractCityFromMessage = (message: string): string | null => {
    const lower = message.toLowerCase();
    const inIndex = lower.lastIndexOf(' in ');
    if (inIndex === -1) {
      return null;
    }
    const cityPart = message.slice(inIndex + 4).trim();
    if (!cityPart) return null;
    const cleaned = cityPart.replace(/[.?!,]/g, '').trim();
    return cleaned || null;
  };

  const fetchSuggestions = async (intent: { type: 'tourist' | 'food'; city: string }) => {
    const baseUrl = intent.type === 'tourist' ? TOURIST_API_URL : FOOD_API_URL;
    // Call Denodo without location filtering so we always get data back,
    // then just pick up to 3 placename values for the response.
    const url = baseUrl;

    const headers: HeadersInit = {};
    if (DENODO_USERNAME && DENODO_PASSWORD) {
      const token = btoa(`${DENODO_USERNAME}:${DENODO_PASSWORD}`);
      headers['Authorization'] = `Basic ${token}`;
    }

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const items: any[] = Array.isArray(data) ? data : data?.elements || data?.rows || [];

      const names = items
        .map((item) => item?.placename)
        .filter((name) => typeof name === 'string' && name.trim().length > 0)
        .slice(0, 3);

      if (!names.length) {
        return `I couldn't find ${intent.type === 'tourist' ? 'tourist places' : 'food spots'} in ${
          intent.city
        } right now. Try another nearby city or refine your query.`;
      }

      const list = names
        .map((name, index) => `${index + 1}. ${name}`)
        .join('\n');

      if (intent.type === 'tourist') {
        return `Here are the top 3 tourist places in ${intent.city}:\n${list}`;
      }
      return `Here are the top 3 food spots in ${intent.city}:\n${list}`;
    } catch (error) {
      return `I'm having trouble reaching the ${
        intent.type === 'tourist' ? 'tourist places' : 'food spots'
      } service right now. Please try again in a moment.`;
    }
  };

  const sendChatMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg: ChatMessage = { id: Date.now().toString(), text, isUser: true };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput('');

    const lower = text.toLowerCase();
    const cityFromMessage = extractCityFromMessage(text);
    const defaultCity = userLocation && userLocation.trim().length > 0 ? userLocation : null;
    const city = cityFromMessage || defaultCity;

    const isFood =
      lower.includes('food') || lower.includes('restaurant') || lower.includes('restaurants');
    const isTourist =
      lower.includes('tourist') || lower.includes('place') || lower.includes('places') || lower.includes('spot');

    // If neither type is clear but we have a city, ask the user which type they want.
    if (!isFood && !isTourist && city) {
      const clarifyTypeMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Do you want tourist places or food spots in ${city}?`,
        isUser: false,
      };
      setChatMessages((prev) => [...prev, clarifyTypeMsg]);
      return;
    }

    // If type is clear but we don't know the city, ask for the city.
    if ((isFood || isTourist) && !city) {
      const clarifyCityMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Which city are you interested in?',
        isUser: false,
      };
      setChatMessages((prev) => [...prev, clarifyCityMsg]);
      return;
    }

    // If neither type nor city is clear, fall back to the existing generic response.
    if (!isFood && !isTourist && !city) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Got it! I will soon use your message to tailor recommendations and trip plans. For now, explore the planner tab to see how your trip could look.',
        isUser: false,
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
      return;
    }

    const intent: { type: 'tourist' | 'food'; city: string } = {
      type: isFood ? 'food' : 'tourist',
      city: city as string,
    };

    const aiText = await fetchSuggestions(intent);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 2).toString(),
      text: aiText,
      isUser: false,
    };
    setChatMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50">
      <motion.header
        className="bg-white/80 backdrop-blur-sm shadow-glass border-b border-gray-200 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-coral-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">
              AI Travel Assistant
            </h1>
          </div>

          <div className="hidden sm:flex items-center text-xs text-gray-500 gap-2">
            <span className="px-2 py-1 rounded-full bg-primary-50 text-primary-700">
              Mood: {userMood || 'Happy'}
            </span>
            <span className="px-2 py-1 rounded-full bg-coral-50 text-coral-700">
              Location: {userLocation || 'Unknown'}
            </span>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2 bg-white/80 rounded-2xl p-1 shadow-floating">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white shadow-glow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-4 h-4" /> Chat
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'planner'
                  ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white shadow-glow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ListChecks className="w-4 h-4" /> Trip Planner
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white shadow-glow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>

        {/* Chat tab */}
        {activeTab === 'chat' && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-floating flex flex-col h-[540px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.isUser
                          ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="whitespace-pre-line">{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask anything about your trip, budget, or mood..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={sendChatMessage}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-coral-500 text-white hover:shadow-glow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-floating p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-coral-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Tips</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">Try asking things like:</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  <li>Suggest tourist places in {userLocation || 'Bangalore'} for a {userMood || 'happy'} mood.</li>
                  <li>Suggest food spots in {userLocation || 'Chennai'} for a {userMood || 'romantic'} mood.</li>
                  <li>I'm in Ooty and feel energetic, show me tourist places.</li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl shadow-floating p-4 text-xs text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>
                  Your recent messages will soon appear in History so you can quickly reuse good prompts for new trips.
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trip Planner tab */}
        {activeTab === 'planner' && (
          <motion.div
            className="bg-white rounded-3xl shadow-floating p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-800">3-day mood-based itinerary</h2>
              </div>
              <span className="hidden sm:inline-flex items-center text-xs text-gray-500 gap-2">
                <span className="px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                  {userLocation || 'Your city'}
                </span>
                <span className="px-2 py-1 rounded-full bg-coral-50 text-coral-700">
                  Mood: {userMood || 'Curious'}
                </span>
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Here is a sample 3-day plan in {userLocation || 'your destination'} tuned to a{' '}
              {userMood || 'relaxed'} mood. You can use this structure together with{' '}
              <button
                onClick={() => onNavigate('trips')}
                className="text-primary-600 underline"
              >
                Saved Trips
              </button>{' '}
              to build a real itinerary.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Day 1 */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-semibold">
                    1
                  </span>
                  <h3 className="font-semibold text-gray-800">Day 1 · Arrive & explore</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold">Morning · </span>
                    Easy intro walk in a central park or promenade to match your {userMood || 'current'} mood.
                  </div>
                  <div>
                    <span className="font-semibold">Afternoon · </span>
                    Visit 1–2 must-see tourist spots in {userLocation || 'the city'} and stop for a local lunch.
                  </div>
                  <div>
                    <span className="font-semibold">Evening · </span>
                    Sunset viewpoint or calm neighborhood café to unwind.
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-semibold">
                    2
                  </span>
                  <h3 className="font-semibold text-gray-800">Day 2 · Deeper experiences</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold">Morning · </span>
                    Start with a popular attraction that fits a {userMood || 'balanced'} vibe (museum, garden, or landmark).
                  </div>
                  <div>
                    <span className="font-semibold">Afternoon · </span>
                    Explore 2–3 nearby spots (food, markets, or viewpoints) grouped in one area to save travel time.
                  </div>
                  <div>
                    <span className="font-semibold">Evening · </span>
                    Choose a signature restaurant or street-food lane in {userLocation || 'town'} and end with a short walk.
                  </div>
                </div>
              </div>

              {/* Day 3 */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-semibold">
                    3
                  </span>
                  <h3 className="font-semibold text-gray-800">Day 3 · Flexible & wrap-up</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold">Morning · </span>
                    Revisit any favorite area from earlier days or add a new place suggested by the AI.
                  </div>
                  <div>
                    <span className="font-semibold">Afternoon · </span>
                    Last-minute shopping, souvenirs, or an extra attraction near your stay.
                  </div>
                  <div>
                    <span className="font-semibold">Evening · </span>
                    Relaxing dinner and an easy route back, keeping your {userMood || 'mood'} calm before departure.
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Tip: Save specific places you like from Explore / Recommendations, then open{' '}
              <button
                onClick={() => onNavigate('trips')}
                className="text-primary-600 underline"
              >
                Saved Trips
              </button>{' '}
              to see them on the map and in a detailed itinerary.
            </p>
          </motion.div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <motion.div
            className="bg-white rounded-3xl shadow-floating p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">Conversation History</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              In the future, this section will show a timeline of your AI chats and Denodo-powered suggestions so you can
              reopen old city searches and reuse prompts that worked well.
            </p>

            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-xs text-gray-500 bg-gray-50">
              No history saved yet. Start a conversation in the Chat tab to begin building your AI travel memory.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;