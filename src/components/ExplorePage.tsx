import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Star, Heart, Navigation, Clock, X } from 'lucide-react';
import Map, { MapMarker } from './Map';
import { dataService } from '../services/dataService';

// Google Maps is used via the shared Map component

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  emotion: string;
  image: string;
  description: string;
  distance?: number;
  reviews?: number;
}

interface ExplorePageProps {
  onNavigate: (page: string) => void;
  onPlaceSelect?: (place: Place) => void;
  userLocation?: string;
  userMood?: string;
  focusPlace?: Place | null;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate, onPlaceSelect, userLocation, userMood, focusPlace }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    emotion: '',
    rating: 0,
    distance: 0,
  });
  const [places, setPlaces] = useState<Place[]>([]);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 }); // Bangalore default
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Utility: map UI category label to internal category
  const mapCategoryToInternal = (label: string): 'tourist' | 'food' | 'emergency' => {
    const l = (label || '').toLowerCase();
    if (l.includes('food')) return 'food';
    if (l.includes('emergency')) return 'emergency';
    // Default and "Tourist Spots" both map to tourist
    return 'tourist';
  };

  // Utility: compute distance in km using Haversine
  const computeDistanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return +(R * c).toFixed(1);
  };

  // When a focusPlace is provided (from Recommendations -> View on Map), center and show it
  useEffect(() => {
    if (focusPlace && typeof focusPlace.lat === 'number' && typeof focusPlace.lng === 'number') {
      setMapCenter({ lat: focusPlace.lat, lng: focusPlace.lng });
      setPlaces([focusPlace]);
      setHoveredPlace(focusPlace);
      return;
    }
  }, [focusPlace?.id, focusPlace?.lat, focusPlace?.lng]);

  // Load places based on userLocation (default to Bangalore mock if no location)
  useEffect(() => {
    if (focusPlace && typeof focusPlace.lat === 'number') return; // Skip auto-load when focusing a place
    // If a location is provided, center map there and load nearby places for selected filters
    const selectedCategory = mapCategoryToInternal(selectedFilters.type || 'Tourist Spots');
    const moodForQuery = selectedFilters.emotion || userMood || '';
    if (userLocation && userLocation.trim().length > 0) {
      import('../services/geoService').then(async ({ geocodeLocation }) => {
        const geo = await geocodeLocation(userLocation);
        if (geo) {
          const center = { lat: geo.lat, lng: geo.lng };
          setMapCenter(center);
          try {
            await dataService.loadGooglePlaces(center.lat, center.lng, selectedCategory, moodForQuery, userLocation);
            const googlePlaces = dataService.getAllPlaces();
            const mapped: Place[] = googlePlaces.map((p, idx) => {
              const pos = { lat: p.Latitude, lng: p.Longitude };
              return {
                id: `${p.PlaceName}-${idx}`,
                name: p.PlaceName,
                lat: pos.lat,
                lng: pos.lng,
                category: p.Category === 'tourist' ? 'Tourist Spots' : p.Category === 'food' ? 'Food' : 'Emergency',
                rating: p.Rating || 0,
                emotion: p.Emotion || '',
                image: p.ImageURL,
                description: p.Details && (p.Details as any).OpeningHours ? 'Open now' : p.Location,
                distance: computeDistanceKm(center, pos),
                reviews: p.Reviews || 0
              };
            });
            setPlaces(mapped);
            return; // Skip mock fallback when live data is loaded
          } catch {
            // fall back to mock below
          }
        }
      });
    }

    const mockPlaces: Place[] = [
      {
        id: '1',
        name: 'Cubbon Park',
        lat: 12.9716,
        lng: 77.5946,
        category: 'Tourist Spots',
        rating: 4.5,
        emotion: 'Relaxed',
        image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
        description: 'A beautiful park in the heart of Bangalore perfect for relaxation and morning walks',
        distance: 2.3,
        reviews: 1250
      },
      {
        id: '2',
        name: 'Lalbagh Botanical Garden',
        lat: 12.9507,
        lng: 77.5848,
        category: 'Tourist Spots',
        rating: 4.3,
        emotion: 'Romantic',
        image: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg',
        description: 'Famous botanical garden with glass house and beautiful flower displays',
        distance: 5.1,
        reviews: 980
      },
      {
        id: '3',
        name: 'MTR Restaurant',
        lat: 12.9716,
        lng: 77.6046,
        category: 'Food',
        rating: 4.7,
        emotion: 'Excited',
        image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        description: 'Authentic South Indian cuisine with traditional flavors and ambiance',
        distance: 1.8,
        reviews: 2100
      },
      {
        id: '4',
        name: 'Bangalore Palace',
        lat: 12.9988,
        lng: 77.5925,
        category: 'Tourist Spots',
        rating: 4.2,
        emotion: 'Curious',
        image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
        description: 'Historic palace with beautiful architecture and royal heritage',
        distance: 8.2,
        reviews: 750
      },
      {
        id: '5',
        name: 'Apollo Hospital',
        lat: 12.9611,
        lng: 77.6472,
        category: 'Emergency',
        rating: 4.6,
        emotion: 'Safe',
        image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
        description: 'Multi-specialty hospital with 24/7 emergency services',
        distance: 3.5,
        reviews: 3200
      },
      {
        id: '6',
        name: 'Taj West End',
        lat: 12.9784,
        lng: 77.6408,
        category: 'Hotels',
        rating: 4.8,
        emotion: 'Luxurious',
        image: 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg',
        description: 'Luxury hotel with heritage architecture and world-class amenities',
        distance: 4.2,
        reviews: 1800
      },
    ];
    // Compute distance from current center for mock
    const withDistance = mockPlaces.map((m) => ({
      ...m,
      distance: computeDistanceKm(mapCenter, { lat: m.lat, lng: m.lng })
    }));
    setPlaces(withDistance);
  }, [userLocation, userMood, selectedFilters.type, selectedFilters.emotion]);

  const emotions = ['Happy', 'Sad', 'Romantic', 'Energetic', 'Tired', 'Relaxed', 'Excited', 'Curious', 'Safe', 'Luxurious'];
  const categories = ['Tourist Spots', 'Food', 'Emergency', 'Hotels'];

  const filteredPlaces = places.filter(place => {
    if (selectedFilters.type && place.category !== selectedFilters.type) return false;
    if (selectedFilters.emotion && place.emotion !== selectedFilters.emotion) return false;
    if (selectedFilters.rating && place.rating < selectedFilters.rating) return false;
    if (selectedFilters.distance && place.distance && place.distance > selectedFilters.distance) return false;
    return true;
  });

  // Build markers for Google Maps
  const markers: MapMarker[] = useMemo(() => filteredPlaces.map((place) => ({
    id: place.id,
    position: { lat: place.lat, lng: place.lng },
    title: `${place.name} • ${place.rating}`,
    onClick: () => setHoveredPlace(place),
  })), [filteredPlaces]);

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
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button 
                onClick={() => onNavigate('home')}
                className="hover:text-primary-600 transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <span className="font-medium text-primary-600">Explore</span>
            </nav>
          </div>
          
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
              Explore Places
            </h1>
            
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Mobile Filter Overlay */}
        {isFilterOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <FilterContent
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  emotions={emotions}
                  categories={categories}
                  filteredPlaces={filteredPlaces}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Desktop Sidebar - Filters */}
        <motion.div
          className="hidden md:block w-80 bg-white/80 backdrop-blur-sm shadow-glass border-r border-gray-200 overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            </div>
            <FilterContent
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              emotions={emotions}
              categories={categories}
              filteredPlaces={filteredPlaces}
            />
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Map
            center={mapCenter}
            zoom={13}
            markers={markers}
            className="h-full w-full"
          />

          {/* Hover Card Preview */}
          {hoveredPlace && (
            <motion.div
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-floating p-4 max-w-sm z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-start space-x-3">
                <img
                  src={hoveredPlace.image}
                  alt={hoveredPlace.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{hoveredPlace.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{hoveredPlace.rating}</span>
                    {hoveredPlace.distance && (
                      <>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{hoveredPlace.distance}km</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {hoveredPlace.emotion}
                    </span>
                    <button 
                      onClick={() => onPlaceSelect?.(hoveredPlace)}
                      className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-600 transition-colors"
                    >
                      Add to Trip
                    </button>
                    <button 
                      onClick={() => setHoveredPlace(null)}
                      className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <motion.div
            className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{filteredPlaces.length}</span> places found
            </p>
          </motion.div>

        {/* Get AI Recommendations CTA */}
        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => onNavigate('recommendations')}
            className="px-5 py-3 bg-gradient-to-r from-primary-500 to-coral-500 text-white text-sm font-semibold rounded-xl shadow-floating hover:shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get AI Recommendations
          </motion.button>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Filter Content Component
const FilterContent: React.FC<{
  selectedFilters: any;
  setSelectedFilters: any;
  emotions: string[];
  categories: string[];
  filteredPlaces: any[];
}> = ({ selectedFilters, setSelectedFilters, emotions, categories, filteredPlaces }) => {
  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Type</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedFilters((prev: any) => ({
                ...prev,
                type: prev.type === category ? '' : category
              }))}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                selectedFilters.type === category
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Emotion Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Emotion</h3>
        <div className="space-y-2">
          {emotions.map((emotion) => (
            <motion.button
              key={emotion}
              onClick={() => setSelectedFilters((prev: any) => ({
                ...prev,
                emotion: prev.emotion === emotion ? '' : emotion
              }))}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                selectedFilters.emotion === emotion
                  ? 'bg-coral-100 text-coral-700 border-2 border-coral-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {emotion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <motion.button
              key={rating}
              onClick={() => setSelectedFilters((prev: any) => ({
                ...prev,
                rating: prev.rating === rating ? 0 : rating
              }))}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                selectedFilters.rating === rating
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>{rating}+</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Distance Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Maximum Distance (km)</h3>
        <div className="space-y-2">
          {[5, 10, 20, 50].map((distance) => (
            <motion.button
              key={distance}
              onClick={() => setSelectedFilters((prev: any) => ({
                ...prev,
                distance: prev.distance === distance ? 0 : distance
              }))}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                selectedFilters.distance === distance
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-4 h-4" />
              <span>{distance}km</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="bg-primary-50 rounded-lg p-4">
        <p className="text-sm text-primary-700">
          <span className="font-semibold">{filteredPlaces.length}</span> places found
        </p>
      </div>
    </div>
  );
};

export default ExplorePage;
