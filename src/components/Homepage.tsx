import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Heart, Utensils, Star, TrendingUp, Sparkles } from 'lucide-react';

interface HomepageProps {
  onNavigate: (page: string) => void;
  onSearch?: (query: string) => void;
  onEmotionSelect?: (emotion: string) => void;
  onCategorySelect?: (category: string) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onNavigate, onSearch, onEmotionSelect, onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const searchSectionRef = useRef<HTMLDivElement | null>(null);
  const moodSectionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  const emotions = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-100 hover:bg-blue-200' },
    { name: 'Romantic', emoji: '💖', color: 'bg-pink-100 hover:bg-pink-200' },
    { name: 'Energetic', emoji: '⚡', color: 'bg-green-100 hover:bg-green-200' },
    { name: 'Tired', emoji: '😴', color: 'bg-purple-100 hover:bg-purple-200' },
  ];

  const categories = [
    { name: 'Tourist Spots', icon: MapPin, color: 'bg-primary-500', hoverColor: 'hover:bg-primary-600' },
    { name: 'Food', icon: Utensils, color: 'bg-coral-500', hoverColor: 'hover:bg-coral-600' },
    { name: 'Hotels', icon: Heart, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
  ];

  const trendingLocations = [
    { name: 'Chennai', country: 'India', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 4.8 },
    { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 4.9 },
    { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 4.7 },
    { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 4.6 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      // Smooth scroll to mood section with some offset below the navbar
      if (moodSectionRef.current) {
        const rect = moodSectionRef.current.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 120; // 120px space from top
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  };

  const handleCategoryClick = (category: string) => {
    // Require a place before allowing type selection
    if (!searchQuery.trim()) {
      if (searchSectionRef.current) {
        const rect = searchSectionRef.current.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 120;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      return;
    }
    // Notify parent about selected category; parent decides where to navigate
    onCategorySelect?.(category);
  };

  const handleEmotionSelect = (emotion: string) => {
    // Require a place before allowing mood selection
    if (!searchQuery.trim()) {
      if (searchSectionRef.current) {
        const rect = searchSectionRef.current.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 120;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      return;
    }
    setSelectedEmotion(emotion);
    onEmotionSelect?.(emotion);
    // After choosing mood, guide user to category/type section with top offset
    if (categorySectionRef.current) {
      const rect = categorySectionRef.current.getBoundingClientRect();
      const offset = window.scrollY + rect.top - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium text-primary-600">Home</span>
            <span>/</span>
            <span>Welcome to Tourmate</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-coral-900/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight">
              Discover Your Perfect
              <span className="block bg-gradient-to-r from-coral-400 to-primary-400 bg-clip-text text-transparent">
                Adventure
              </span>
            </h1>
            <p className="text-lg md:text-2xl mb-10 md:mb-12 font-light max-w-3xl mx-auto text-white/90">
              Let AI-powered recommendations guide you to places that match your mood and create unforgettable memories
            </p>

            {/* Search Bar */}
            <motion.div
              ref={searchSectionRef}
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Where do you want to explore today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-4 py-5 md:py-6 text-base md:text-lg border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-300/80 focus:border-white bg-white/95 backdrop-blur-sm shadow-lg shadow-black/10 transition-all duration-300 text-gray-900 placeholder:text-gray-600 caret-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-floating hover:shadow-glow transition-colors whitespace-nowrap"
                >
                  Enter
                </button>
              </form>
            </motion.div>

            {/* Emotion Selector */}
            <motion.div
              ref={moodSectionRef}
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-coral-400 mr-2" />
                <h3 className="text-2xl font-semibold">How are you feeling today?</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {emotions.map((emotion, index) => (
                  <motion.button
                    key={emotion.name}
                    onClick={() => {
                      handleEmotionSelect(emotion.name);
                    }}
                    className={`${emotion.color} ${
                      selectedEmotion === emotion.name
                        ? 'ring-2 ring-white shadow-xl scale-105'
                        : selectedEmotion
                        ? 'opacity-50'
                        : 'shadow-sm'
                    } px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/40 backdrop-blur-sm transition-all duration-300 flex items-center space-x-2`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="font-medium text-gray-700">{emotion.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={() => onNavigate('explore')}
                className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-2xl shadow-floating hover:shadow-glow transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Exploring
              </motion.button>
              <motion.button
                onClick={() => onNavigate('trips')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white text-lg font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                View Saved Trips
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categorySectionRef} className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What are you looking for?</h2>
            <p className="text-xl text-gray-600">Explore different types of places and experiences</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`${category.color} ${category.hoverColor} text-white p-8 rounded-3xl shadow-floating transition-all duration-300 group cursor-pointer`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <IconComponent className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-semibold text-center">{category.name}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-coral-500 mr-2" />
              <h2 className="text-4xl font-bold text-gray-800">Trending Destinations</h2>
            </div>
            <p className="text-xl text-gray-600">Popular places travelers are loving right now</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingLocations.map((location, index) => (
              <motion.div
                key={location.name}
                onClick={() => {
                  setSearchQuery(location.name);
                  onSearch?.(location.name);
                  // Let the user then pick how they feel and what they are looking for
                }}
                className="bg-white rounded-3xl shadow-floating overflow-hidden group cursor-pointer border border-white/60"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Soft gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold text-white">{location.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 flex items-center justify-between">
                    <span>{location.name}</span>
                  </h3>
                  <p className="text-sm text-gray-600">{location.country}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Quick Tip Section */}
      <section className="py-16 bg-gradient-to-r from-primary-100 to-coral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-floating"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-coral-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Travel Tip</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Did you know? Our AI analyzes your mood, preferences, and current location to suggest 
                  the perfect places for you. The more you interact with our recommendations, the smarter 
                  our suggestions become!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
