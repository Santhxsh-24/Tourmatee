import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, MapPin, Clock, Users, Phone, Navigation, Share2, ArrowLeft, ChevronLeft, ChevronRight, Bot, X } from 'lucide-react';
import Map, { MapMarker } from './Map';

interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  emotion: string;
  rating: number;
  images: string[];
  description: string;
  distance: number;
  reviews: number;
  price?: string;
  openingHours?: string;
  address?: string;
  phone?: string;
  highlights: string[];
  nearbyPlaces: Array<{
    id: string;
    name: string;
    distance: number;
    category: string;
    rating: number;
    image: string;
  }>;
  lat?: number;
  lng?: number;
}

interface PlaceDetailPageProps {
  place: PlaceDetail;
  onNavigate: (page: string) => void;
  onAddToTrip: (place: PlaceDetail) => boolean;
  onNearbySelect: (place: any) => void;
  onAskAI: (place: PlaceDetail) => void;
}

const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({
  place,
  onNavigate,
  onAddToTrip,
  onNearbySelect,
  onAskAI
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState<null | { text: string; variant: 'success' | 'warning' }>(null);
  const [isSaved, setIsSaved] = useState(false);

  const center = useMemo(() => ({ lat: place.lat ?? 12.9716, lng: place.lng ?? 77.5946 }), [place.lat, place.lng]);
  const markers: MapMarker[] = useMemo(() => [{ id: place.id, position: center, title: place.name }], [place.id, center, place.name]);

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
      case 'Tourist Spots': return 'bg-blue-100 text-blue-700';
      case 'Food': return 'bg-orange-100 text-orange-700';
      case 'Emergency': return 'bg-red-100 text-red-700';
      case 'Hotels': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
  };

  // no-op

  const handleShare = async () => {
    try {
      const text = `${place.name} — ${place.category}\nRating: ${place.rating} (${place.reviews} reviews)\n${place.address || ''}`;
      if (typeof (navigator as any).share === 'function') {
        await (navigator as any).share({ title: place.name, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 1500);
    } catch {}
  };

  const openDirections = () => {
    const q = place.lat && place.lng ? `${place.lat},${place.lng}` : encodeURIComponent(place.address || place.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    window.open(url, '_blank');
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
              onClick={() => onNavigate('recommendations')}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">
              {place.name}
            </h1>
            
            <motion.button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isSharing ? 'Copied!' : 'Share'}
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Carousel */}
            <motion.div
              className="relative bg-white rounded-3xl shadow-floating overflow-hidden mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-96">
                <img
                  src={place.images[currentImageIndex]}
                  alt={place.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
                
                {/* Navigation Arrows */}
                {place.images.length > 1 && (
                  <>
                    <motion.button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </motion.button>
                    <motion.button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </motion.button>
                  </>
                )}

                {/* Image Indicators */}
                {place.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {place.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Category and Emotion Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(place.category)} shadow-lg`}>
                    {place.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg">
                    {getEmotionEmoji(place.emotion)} {place.emotion}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">{place.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Place Information */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating p-8 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{place.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{place.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <Star className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-xl font-bold text-gray-800">{place.rating}</p>
                </div>
                <div className="text-center p-4 bg-coral-50 rounded-xl">
                  <Users className="w-6 h-6 text-coral-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Reviews</p>
                  <p className="text-xl font-bold text-gray-800">{place.reviews}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xl font-bold text-gray-800">{place.distance}km</p>
                </div>
                {place.price && (
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <span className="text-2xl font-bold text-purple-600">{place.price}</span>
                    <p className="text-sm text-gray-600 mt-1">Average</p>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Why you'll love it</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {place.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              {(place.openingHours || place.address || place.phone) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
                  <div className="space-y-3">
                    {place.openingHours && (
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{place.openingHours}</span>
                      </div>
                    )}
                    {place.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{place.address}</span>
                      </div>
                    )}
                    {place.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{place.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Action Buttons */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating p-6 mb-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="space-y-4">
                <motion.button
                  onClick={() => {
                    const added = onAddToTrip(place);
                    const text = added
                      ? `${place.name} has been added to your saved trip list. View it anytime in “Saved Trips”.`
                      : `You’ve already added this place to your trip.`;
                    setShowSavedToast({ text, variant: added ? 'success' : 'warning' });
                    setIsSaved(true);
                    setTimeout(() => setShowSavedToast(null), 3500);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-500 to-coral-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="w-5 h-5" />
                  <span>{isSaved ? 'Saved ✓' : 'Add to Trip'}</span>
                </motion.button>

                <motion.button
                  onClick={() => onAskAI(place)}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-white border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bot className="w-5 h-5" />
                  <span>Ask AI about this place</span>
                </motion.button>

                <motion.button
                  onClick={openDirections}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Navigation className="w-5 h-5" />
                  <span>Get Directions</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-800">{place.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mood Match</span>
                  <span className="font-medium text-gray-800">{place.emotion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium text-gray-800">{place.distance}km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium text-gray-800">{place.reviews}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <motion.div
            className="relative max-w-4xl max-h-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={place.images[currentImageIndex]}
              alt={place.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            className={`fixed top-6 right-6 z-50 rounded-xl shadow-glow px-5 py-4 text-white ${showSavedToast.variant === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
            role="status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-xs">
                <div className="text-sm font-semibold">{showSavedToast.text}</div>
                {showSavedToast.variant === 'success' && (
                  <button onClick={() => onNavigate('trips')} className="mt-2 text-xs underline underline-offset-2">Open Saved Trips</button>
                )}
              </div>
              <button onClick={() => setShowSavedToast(null)} className="ml-2 opacity-90 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaceDetailPage;
