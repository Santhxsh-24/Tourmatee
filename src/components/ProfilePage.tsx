import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Heart, Settings, Brain, Clock, Sparkles, Bell } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  userLocation: string;
  userMood: string;
  savedTripsCount: number;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, userLocation, userMood, savedTripsCount }) => {
  const preferences = [
    { label: 'Default mood', value: userMood || 'Happy' },
    { label: 'Default location', value: userLocation || 'Bangalore' },
    { label: 'Notifications', value: 'Enabled' },
  ];

  const aiInsights = [
    'Tourmate is learning that you enjoy places that match your current mood.',
    'Your recent searches are helping us refine recommendations near your favorite cities.',
    'Interacting with the AI Assistant will build up your AI history here.',
  ];

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
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </motion.button>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-coral-500 bg-clip-text text-transparent">
              Your Profile
            </h1>

            <div className="w-20" />
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left: Profile + Preferences + Notifications */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Profile Card */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-floating border border-white/70 p-5 md:p-6 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-coral-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">Traveler</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Personalize Tourmate so recommendations and trips feel more like <span className="font-medium">you</span>.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                    <MapPin className="w-3 h-3 mr-1" />
                    Base: {userLocation || 'Bangalore'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-coral-50 text-coral-700 border border-coral-100">
                    <Heart className="w-3 h-3 mr-1" />
                    Mood: {userMood || 'Happy'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Trips saved: {savedTripsCount}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Preferences Card */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating border border-gray-100 p-4 md:p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                </div>
                <span className="text-xs text-gray-500">Coming soon: editable settings</span>
              </div>

              <div className="divide-y divide-gray-100">
                {preferences.map((pref) => (
                  <div key={pref.label} className="py-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{pref.label}</span>
                    <span className="text-sm font-medium text-gray-900">{pref.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick actions to make this section more useful */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-500">Quick actions</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('explore')}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    Explore places
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('trips')}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-coral-50 text-coral-700 hover:bg-coral-100 transition-colors"
                  >
                    View saved trips
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notifications Card (moved from right column) */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating border border-gray-100 p-4 md:p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Weather alerts, event updates, and emergency warnings will appear here and in the global notification bell.
              </p>
              <button
                className="mt-1 inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors"
                onClick={() => onNavigate('explore')}
              >
                Explore places to start receiving smarter alerts
              </button>
            </motion.div>
          </div>

          {/* Right: AI History / Learning */}
          <div className="space-y-4 md:space-y-6">
            {/* Learning from You */}
            <motion.div
              className="bg-gradient-to-br from-primary-100 to-coral-100 rounded-3xl shadow-floating border border-white/70 p-4 md:p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-primary-500 to-coral-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1">
                    Learning from you
                    <Sparkles className="w-4 h-4 text-coral-500" />
                  </h3>
                  <p className="text-xs text-gray-700">
                    Tourmate adapts its recommendations based on how you explore, save trips, and chat with the AI Assistant.
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-gray-700">
                {aiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* AI History placeholder */}
            <motion.div
              className="bg-white rounded-3xl shadow-floating border border-gray-100 p-4 md:p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-800">AI History</h3>
                </div>
                <span className="text-xs text-gray-500">Coming soon</span>
              </div>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                Here you will be able to see a history of your conversations with the AI Travel Assistant and reuse past queries.
              </p>
              <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs text-gray-500 bg-gray-50">
                No AI conversations saved yet. Start chatting with the assistant from the bottom-right corner to build your history.
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
