import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-primary-900 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-coral-500 to-primary-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Tourmate</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your AI-powered travel companion, helping you discover amazing places that match your mood and create unforgettable memories.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-coral-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-coral-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-coral-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-coral-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Explore Destinations
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  AI Recommendations
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Emergency Services
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Food & Restaurants
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Help Center
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Contact Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Privacy Policy
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-gray-300 hover:text-coral-400 transition-colors text-sm"
                  whileHover={{ x: 5 }}
                >
                  Terms of Service
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-coral-400" />
                <span className="text-gray-300 text-sm">hello@tourmate.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-coral-400" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-coral-400" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-300 text-sm">
            © {currentYear} Tourmate. All rights reserved.
          </p>
          <p className="text-gray-300 text-sm mt-2 md:mt-0">
            Made with ❤️ for travelers worldwide
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

