import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Navigation, Trash2, Download } from 'lucide-react';
import Map, { MapMarker } from './Map';

interface SavedTripsPageProps {
  onNavigate: (page: string) => void;
  onViewOnMap: (place: { id: string; name: string; lat?: number; lng?: number; image?: string; rating?: number; }) => void;
  places?: Array<{ id: string; name: string; lat?: number; lng?: number; image?: string; rating?: number; }>;
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
}

const SavedTripsPage: React.FC<SavedTripsPageProps> = ({ onNavigate, onViewOnMap, places = [], onRemove, onClearAll }) => {
  const hasPlaces = places && places.length > 0;
  const [activeTab, setActiveTab] = useState<'trips' | 'map'>('trips');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(undefined);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const center = useMemo(() => {
    if (hasPlaces) {
      const selected = selectedPlaceId
        ? places.find(p => p.id === selectedPlaceId)
        : places[0];
      const target = selected || places[0];
      if (target) {
        return { lat: target.lat ?? 12.9716, lng: target.lng ?? 77.5946 };
      }
    }
    return { lat: 12.9716, lng: 77.5946 };
  }, [hasPlaces, places, selectedPlaceId]);

  const markers: MapMarker[] = useMemo(
    () =>
      (places || []).map(p => ({
        id: p.id,
        position: { lat: p.lat ?? 12.9716, lng: p.lng ?? 77.5946 },
        title: p.name,
        onClick: () => {
          setSelectedPlaceId(p.id);
          const el = cardRefs.current[p.id];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
      })),
    [places]
  );

  // Itinerary features removed; this page now focuses on saved trips list and map view.
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50">
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
              Saved Trips
            </h1>

            <div className="w-20"></div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary bar */}
        <div className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-floating border border-white/60">
          <div>
            <div className="text-sm font-semibold text-gray-800">Saved trips overview</div>
            <div className="text-xs text-gray-500">{hasPlaces ? `${places.length} place${places.length > 1 ? 's' : ''} saved` : 'No places saved yet'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex space-x-2 bg-white/80 rounded-2xl p-1 shadow-floating">
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'trips'
                  ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white shadow-glow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-primary-500 to-coral-500 text-white shadow-glow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Map View
            </button>
          </div>

          {hasPlaces && (
            <div className="flex items-center gap-3">
              {onClearAll && (
                <button onClick={onClearAll} className="text-gray-500 hover:text-red-600 text-sm">Clear All</button>
              )}
            </div>
          )}
        </div>

        {!hasPlaces ? (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-floating p-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-coral-500 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No saved trips yet</h2>
            <p className="text-gray-600 mb-8">Start exploring and add places you love to your trip.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => onNavigate('explore')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-coral-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Exploring
              </motion.button>
              <motion.button
                onClick={() => onNavigate('explore')}
                className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-500 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="w-5 h-5" />
                <span>View Map</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {activeTab === 'trips' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  className="lg:col-span-2 bg-white rounded-3xl shadow-floating p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-full h-[520px] rounded-2xl overflow-hidden">
                    <Map center={center} zoom={13} markers={markers} />
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white rounded-3xl shadow-floating p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Saved Places</h3>
                  </div>
                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                    {places.map(p => (
                      <div
                        key={p.id}
                        ref={el => {
                          cardRefs.current[p.id] = el;
                        }}
                        onClick={() => setSelectedPlaceId(p.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-colors shadow-sm cursor-pointer ${
                          selectedPlaceId === p.id
                            ? 'bg-primary-50 ring-2 ring-primary-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <img
                          src={p.image || 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg'}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-800 truncate" title={p.name}>{p.name}</div>
                            {typeof p.rating === 'number' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                ⭐ {p.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Saved place</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewOnMap(p)}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            Map
                          </button>
                          {onRemove && (
                            <button
                              onClick={() => onRemove(p.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'map' && (
              <motion.div
                className="bg-white rounded-3xl shadow-floating p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Map View</h3>
                  <span className="text-xs text-gray-500">{places.length} place(s)</span>
                </div>
                <div className="w-full h-[560px] rounded-2xl overflow-hidden">
                  <Map center={center} zoom={13} markers={markers} />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedTripsPage;


