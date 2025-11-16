import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MapPin, Star, Heart, Navigation, Clock, Sparkles, ArrowRight, Users } from 'lucide-react';
import { geocodeLocation } from '../services/geoService';
import { dataService } from '../services/dataService';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  emotion: string;
  rating: number;
  image: string;
  description: string;
  distance: number;
  highlights: string[];
  aiMessage: string;
  reviews: number;
  price?: string;
  lat?: number;
  lng?: number;
}

interface RecommendationsPageProps {
  recommendations: Recommendation[];
  userLocation: string;
  userMood: string;
  onNavigate: (page: string) => void;
  onViewOnMap: (recommendation: Recommendation) => void;
  onAddToTrip: (recommendation: Recommendation) => void;
  onPlaceSelect: (recommendation: Recommendation) => void;
  onMoodChange: (mood: string) => void;
  onTypeChange: (label: string) => void;
}

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  userLocation,
  userMood,
  onNavigate,
  onViewOnMap,
  onAddToTrip,
  onPlaceSelect,
  onMoodChange,
  onTypeChange
}) => {
  const [filters, setFilters] = useState<{ type: string; emotion: string; rating: number; distance: number }>({
    type: '',
    emotion: '',
    rating: 0,
    distance: 0
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [items, setItems] = useState<Recommendation[]>(recommendations || []);

  const computeDistanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return +(R * c).toFixed(1);
  };

  const mapTypeToInternal = (label: string): 'tourist' | 'food' | 'emergency' => {
    const l = (label || '').toLowerCase();
    if (l.includes('food')) return 'food';
    if (l.includes('hotel')) return 'emergency';
    return 'tourist';
  };

  // Sync filters with incoming recommendations so category (Tourist Spots / Food / Emergency)
  // always matches the latest selection made on the homepage.
  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      const firstCategory = recommendations[0].category;
      setFilters({
        type: firstCategory || '',
        emotion: userMood || '',
        rating: 0,
        distance: 0
      });
    }
  }, [recommendations, userMood]);

  // Keep items in sync with the recommendations computed in App.tsx
  // so location (e.g. Kerala) and category (Tourist Spots / Food / Hotels)
  // always reflect the latest user selection.
  useEffect(() => {
    setItems(recommendations || []);
  }, [recommendations]);

  const filtered = useMemo(() => {
    const strict = items.filter((it) => {
      if (filters.type && it.category !== filters.type) return false;
      if (filters.emotion && it.emotion !== filters.emotion) return false;
      if (filters.rating && it.rating < filters.rating) return false;
      if (filters.distance && it.distance > filters.distance) return false;
      return true;
    });
    return strict;
  }, [items, filters]);

  // No map on this page
  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'Romantic': return '💖';
      case 'Excited': return '⚡';
      case 'Relaxed': return '😌';
      case 'Happy': return '😊';
      case 'Curious': return '🤔';
      case 'Energetic': return '🏃‍♂️';
      case 'Tired': return '😴';
      default: return '✨';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tourist Spots': return 'from-blue-500 to-cyan-500';
      case 'Food': return 'from-orange-500 to-red-500';
      case 'Hotels': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Romantic': return 'bg-pink-100 text-pink-700';
      case 'Excited': return 'bg-green-100 text-green-700';
      case 'Relaxed': return 'bg-blue-100 text-blue-700';
      case 'Happy': return 'bg-yellow-100 text-yellow-700';
      case 'Curious': return 'bg-purple-100 text-purple-700';
      case 'Energetic': return 'bg-orange-100 text-orange-700';
      case 'Tired': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50">
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-sm shadow-glass border-b border-gray-200 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Navigation className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">
              AI Recommendations
            </h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filters.type}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ ...filters, type: value });
              onTypeChange(value);
            }}
            className="px-3 py-2 border rounded-xl bg-white/90"
          >
            <option value="">All Types</option>
            <option>Tourist Spots</option>
            <option>Food</option>
            <option>Hotels</option>
          </select>
          <select
            value={filters.emotion}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ ...filters, emotion: value });
              if (value) {
                onMoodChange(value);
              }
            }}
            className="px-3 py-2 border rounded-xl bg-white/90"
          >
            <option value="">Any Emotion</option>
            <option>Happy</option>
            <option>Sad</option>
            <option>Romantic</option>
            <option>Energetic</option>
            <option>Tired</option>
          </select>
          <select value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })} className="px-3 py-2 border rounded-xl bg-white/90">
            <option value={0}>Any Rating</option>
            <option value={4.5}>4.5+</option>
            <option value={4}>4.0+</option>
            <option value={3.5}>3.5+</option>
          </select>
          <select value={filters.distance} onChange={(e) => setFilters({ ...filters, distance: Number(e.target.value) })} className="px-3 py-2 border rounded-xl bg-white/90">
            <option value={0}>Any Distance</option>
            <option value={5}>≤ 5 km</option>
            <option value={10}>≤ 10 km</option>
            <option value={20}>≤ 20 km</option>
          </select>
        </div>

        {/* Layout: Cards only */}
        <div>
        {/* AI Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-primary-100 to-coral-100 rounded-3xl p-8 shadow-floating border border-white/50">
            <div className="flex items-start space-x-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-primary-500 to-coral-500 rounded-full flex items-center justify-center flex-shrink-0"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-coral-500" />
                  <span className="text-sm font-semibold text-gray-600">Tourmate AI</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Since you're in <span className="font-semibold text-primary-600">{userLocation}</span> and feeling{' '}
                  <span className="font-semibold text-coral-600">{filters.emotion || userMood}</span>, here are{' '}
                  <span className="font-semibold text-primary-600">{recommendations.length}</span> perfect places that match your mood! 🍃
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Each recommendation is carefully selected based on your preferences and current emotional state.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filtered.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-floating overflow-hidden border border-white/50 group hover:shadow-glow transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onPlaceSelect(recommendation)}
            >
              {/* Image with Gradient Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={recommendation.image}
                  alt={recommendation.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryColor(recommendation.category)} opacity-20`} />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(recommendation.category)} shadow-lg`}>
                    {recommendation.category}
                  </span>
                </div>

                {/* Emotion Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmotionColor(recommendation.emotion)} shadow-lg`}>
                    {getEmotionEmoji(recommendation.emotion)} {recommendation.emotion}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">{recommendation.rating}</span>
                  </div>
                </div>

                {/* Price */}
                {recommendation.price && (
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                      {recommendation.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {recommendation.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {recommendation.description}
                </p>

                {/* Distance and Reviews */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{recommendation.distance}km away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{recommendation.reviews} reviews</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Why you'll love it:</h4>
                  <div className="space-y-1">
                    {recommendation.highlights.slice(0, 2).map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        <span className="text-sm text-gray-600">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Message */}
                <div className="bg-gradient-to-r from-primary-50 to-coral-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-primary-700 italic">"{recommendation.aiMessage}"</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={() => onAddToTrip(recommendation)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Save</span>
                  </motion.button>

                  <motion.button
                    onClick={() => onViewOnMap(recommendation)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-coral-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View on Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
          </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-gradient-to-r from-primary-100 to-coral-100 rounded-3xl p-8 shadow-floating">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to explore these amazing places?
            </h3>
            <p className="text-gray-600 mb-6">
              Create your personalized itinerary and start your adventure today!
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-coral-500 text-white text-lg font-semibold rounded-2xl shadow-floating hover:shadow-glow transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Create My Itinerary
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
