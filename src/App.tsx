import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Homepage from './components/Homepage';
import ExplorePage from './components/ExplorePage';
import RecommendationsPage from './components/RecommendationsPage';
import SavedTripsPage from './components/SavedTripsPage';
import PlaceDetailPage from './components/PlaceDetailPage';
import ProfilePage from './components/ProfilePage';
import AIAssistantPage from './components/AIAssistantPage';
import { mockPlacesData } from './data/mockData';
import { dataService } from './services/dataService';
import { geocodeLocation } from './services/geoService';

type PageType = 'home' | 'explore' | 'recommendations' | 'trips' | 'place-detail' | 'profile' | 'ai-assistant';

interface Place {
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

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState('Bangalore');
  const [userMood, setUserMood] = useState('Happy');
  const [userCategory, setUserCategory] = useState<'tourist' | 'food' | 'emergency'>('tourist');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  // Persist saved trips to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tourmate:saved');
      if (raw) setSavedPlaces(JSON.parse(raw));
    } catch {}
  }, []);

  // Always scroll to top when changing pages so each screen starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    try {
      localStorage.setItem('tourmate:saved', JSON.stringify(savedPlaces));
    } catch {}
  }, [savedPlaces]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data service
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing Tourmate...');
        if (mockPlacesData && mockPlacesData.length > 0) {
          dataService.setMockData(mockPlacesData);
          console.log('✅ Tourmate initialized successfully with', mockPlacesData.length, 'places');
        } else {
          console.warn('⚠️ No mock data available');
        }
      } catch (error) {
        console.error('⚠️ Failed to initialize:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Compute distance in km
  const computeDistanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return +(R * c).toFixed(1);
  };

  // Load recommendations when navigating to recommendations
  useEffect(() => {
    const loadRecs = async () => {
      try {
        const geo = await geocodeLocation(userLocation);
        if (!geo) return;
        const center = { lat: geo.lat, lng: geo.lng };
        // Category chosen from homepage or defaults; mood tailored via dataService keyword mapping
        await dataService.loadGooglePlaces(center.lat, center.lng, userCategory, userMood, userLocation);

        // Prefer Google data when available; always try to keep results scoped
        // to the typed location (e.g. Kerala) when possible.
        let places = dataService.getAllPlaces();

        // First, if we're on mock/CSV/Denodo data, always scope results to the
        // typed location/state. If there are no matches, we prefer showing an
        // empty list over misleading cross-city results (e.g. Chennai when the
        // user typed Goa).
        if (!dataService.isUsingGoogleData()) {
          const filteredByLocation = dataService.getPlacesByLocation(userLocation);
          places = filteredByLocation;
        }

        // Additionally, when using live Google data, apply a lightweight
        // client-side filter so that if there are enough matches for the
        // typed location text (e.g. "Kerala"), we prefer those over
        // cross-city results like Chennai.
        const locationText = userLocation.toLowerCase();
        const geoScoped = places.filter((p: any) => {
          const loc = (p.Location || '').toLowerCase();
          const state = (p.State || '').toLowerCase();
          return loc.includes(locationText) || state.includes(locationText);
        });
        if (geoScoped.length > 0) {
          places = geoScoped;
        }

        const mapped = places.slice(0, 18).map((p, idx) => ({
          id: `${p.PlaceName}-${idx}`,
          name: p.PlaceName,
          category: p.Category === 'tourist' ? 'Tourist Spots' : p.Category === 'food' ? 'Food' : 'Hotels',
          emotion: userMood,
          rating: p.Rating || 0,
          image: p.ImageURL,
          description: p.Location,
          distance: computeDistanceKm(center, { lat: p.Latitude, lng: p.Longitude }),
          highlights: ['Matches your mood', 'Popular nearby'],
          aiMessage: `Great pick in ${userLocation} for your ${userMood.toLowerCase()} mood!`,
          reviews: p.Reviews || 0,
          lat: p.Latitude,
          lng: p.Longitude
        }));
        setRecommendations(mapped);
      } catch {
        // keep existing recommendations on error
      }
    };

    if (currentPage === 'recommendations') {
      loadRecs();
    }
  }, [currentPage, userLocation, userMood, userCategory]);

  // Navigation handler
  const handleNavigate = (page: string) => {
    console.log('Navigate to:', page);
    setCurrentPage(page as PageType);
  };

  const handlePlaceSelect = (place: any) => {
    // Convert to PlaceDetail format
    const placeDetail: Place = {
      id: place.id,
      name: place.name,
      category: place.category,
      emotion: place.emotion,
      rating: place.rating,
      images: [place.image, place.image, place.image], // Mock multiple images
      description: place.description,
      distance: place.distance,
      reviews: place.reviews || 1000,
      price: place.price,
      openingHours: '9:00 AM - 6:00 PM',
      // For live/google places, description typically already contains the
      // formatted address (e.g. full Chennai address for Semmozhi Poonga).
      // We avoid hardcoding a Bangalore address here so that Get Directions
      // can use the real destination.
      address: undefined,
      phone: '+91 80 1234 5678',
      highlights: place.highlights || ['Great atmosphere', 'Good for families', 'Photogenic'],
      nearbyPlaces: [
        {
          id: 'nearby1',
          name: 'Nearby Restaurant',
          distance: 0.5,
          category: 'Food',
          rating: 4.2,
          image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg'
        }
      ],
      lat: typeof place.lat === 'number' ? place.lat : undefined,
      lng: typeof place.lng === 'number' ? place.lng : undefined
    };
    setSelectedPlace(placeDetail);
    setCurrentPage('place-detail');
  };

  const handleAddToTrip = (place: Place): boolean => {
    let added = false;
    setSavedPlaces(prev => {
      const exists = prev.some(p => p.id === place.id);
      if (exists) return prev;
      added = true;
      return [...prev, place];
    });
    return added;
  };

  const handleRemoveFromTrip = (placeId: string) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== placeId));
  };

  const handleClearTrips = () => {
    setSavedPlaces([]);
  };

  const handleViewOnMap = (recommendation: any) => {
    // Navigate to explore and center on the selected recommendation
    // Also seed a temporary marker so the user sees the exact place
    if (recommendation && typeof recommendation.lat === 'number' && typeof recommendation.lng === 'number') {
      // Store selectedPlace with minimal info so Explore can pick it if needed
      setSelectedPlace({
        id: recommendation.id,
        name: recommendation.name,
        category: recommendation.category,
        emotion: recommendation.emotion,
        rating: recommendation.rating,
        images: [recommendation.image],
        description: recommendation.description,
        distance: recommendation.distance || 0,
        reviews: recommendation.reviews || 0,
        highlights: recommendation.highlights || [],
        lat: recommendation.lat,
        lng: recommendation.lng
      } as any);
    }
    setCurrentPage('explore');
  };

  // Bridge from a simple recommendation card click into the full place-detail
  // navigation logic used across the app.
  const handleRecommendationSelect = (recommendation: any) => {
    handlePlaceSelect(recommendation);
  };

  const handleAskAI = (place: Place) => {
    const msg = `Tell me about ${place.name} (${place.category}). Rating ${place.rating} with ${place.reviews} reviews. I feel ${userMood}. Suggest tips and similar places nearby.`;
    setInitialAIPrompt(msg);
    setIsAIAssistantOpen(true);
  };

  const handlePlanTripFromAssistant = (params: { location?: string; mood?: string; days?: number; budget?: number }) => {
    if (params.location && params.location.trim()) {
      setUserLocation(params.location);
    }
    if (params.mood && params.mood.trim()) {
      setUserMood(params.mood);
    }
    // Existing effect will load recommendations when page is 'recommendations'
    setCurrentPage('recommendations');
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Tourmate</h2>
          <p className="text-gray-600">Initializing your travel companion...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50">
      {/* Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Homepage
                onNavigate={handleNavigate}
                onSearch={(q) => setUserLocation(q)}
                onEmotionSelect={(m) => setUserMood(m)}
                onCategorySelect={(categoryName) => {
                  const key = categoryName === 'Food' ? 'food' : categoryName === 'Hotels' ? 'emergency' : 'tourist';
                  setUserCategory(key);
                  setCurrentPage('recommendations');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'ai-assistant' && (
            <motion.div
              key="ai-assistant"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <AIAssistantPage
                onNavigate={handleNavigate}
                userLocation={userLocation}
                userMood={userMood}
              />
            </motion.div>
          )}

          {currentPage === 'explore' && (
            <motion.div
              key="explore"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ExplorePage
                onNavigate={handleNavigate}
                onPlaceSelect={handlePlaceSelect}
                userLocation={userLocation}
                userMood={userMood}
                focusPlace={selectedPlace as any}
              />
            </motion.div>
          )}

          {currentPage === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <RecommendationsPage
                recommendations={recommendations}
                userLocation={userLocation}
                userMood={userMood}
                onNavigate={handleNavigate}
                onViewOnMap={handleViewOnMap}
                onAddToTrip={handleAddToTrip}
                onPlaceSelect={handleRecommendationSelect}
                onMoodChange={(mood) => {
                  setUserMood(mood);
                }}
                onTypeChange={(label) => {
                  const l = (label || '').toLowerCase();
                  const cat: 'tourist' | 'food' | 'emergency' =
                    l.includes('food') ? 'food' : l.includes('hotel') ? 'emergency' : 'tourist';
                  setUserCategory(cat);
                }}
              />
            </motion.div>
          )}

          {currentPage === 'trips' && (
            <motion.div
              key="trips"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SavedTripsPage
                onNavigate={handleNavigate}
                onViewOnMap={(p) => {
                  setSelectedPlace({
                    id: p.id,
                    name: p.name,
                    category: 'Tourist Spots',
                    emotion: 'Happy',
                    rating: p.rating || 0,
                    images: [p.image || ''],
                    description: p.name,
                    distance: 0,
                    reviews: 0,
                    highlights: [],
                    lat: p.lat,
                    lng: p.lng
                  } as any);
                  setCurrentPage('explore');
                }}
                places={savedPlaces}
                onRemove={handleRemoveFromTrip}
                onClearAll={handleClearTrips}
              />
            </motion.div>
          )}

          {currentPage === 'place-detail' && selectedPlace && (
            <motion.div
              key="place-detail"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <PlaceDetailPage
                place={selectedPlace}
                onNavigate={handleNavigate}
                onAddToTrip={handleAddToTrip}
                onNearbySelect={handlePlaceSelect}
                onAskAI={handleAskAI}
              />
            </motion.div>
          )}

          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ProfilePage
                onNavigate={handleNavigate}
                userLocation={userLocation}
                userMood={userMood}
                savedTripsCount={savedPlaces.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        userLocation={userLocation}
        userMood={userMood}
        onShowRecommendations={() => {
          setCurrentPage('recommendations');
          setIsAIAssistantOpen(false);
        }}
        initialMessage={initialAIPrompt || ''}
        onPlanTrip={handlePlanTripFromAssistant}
        onOpenFullAssistant={() => {
          setCurrentPage('ai-assistant');
          setIsAIAssistantOpen(false);
        }}
      />
    </div>
  );
}

export default App;