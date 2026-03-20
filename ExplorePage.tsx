'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConfigStore, useServicesStore, useLookbookStore, useLoyaltyStore } from '@/lib/store';
import { RANK_CONFIGS } from '@/lib/types';
import { generateWhatsAppLink } from '@/lib/db-storage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Star, Users, Calendar, MapPin, Phone, Clock, Gift, X } from 'lucide-react';

interface ExplorePageProps {
  onClose: () => void;
}

export function ExplorePage({ onClose }: ExplorePageProps) {
  const { config, refreshConfig } = useConfigStore();
  const { services, refreshServices } = useServicesStore();
  const { items: lookbook, refreshLookbook } = useLookbookStore();
  const { shopItems, refreshLoyalty } = useLoyaltyStore();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('hair');

  useEffect(() => {
    refreshConfig();
    refreshServices();
    refreshLookbook();
    refreshLoyalty();
  }, []);

  const vibes = config?.vibes || [
    { id: 'v1', emoji: '✨', label: 'Glamorous', color: '#c9a84c' },
    { id: 'v2', emoji: '🌸', label: 'Romantic', color: '#e8a4b8' },
    { id: 'v3', emoji: '🌿', label: 'Natural', color: '#8bc38b' },
    { id: 'v4', emoji: '👑', label: 'Bridal', color: '#c9a84c' },
    { id: 'v5', emoji: '💆', label: 'Relaxed', color: '#9bb8d4' },
    { id: 'v6', emoji: '🔥', label: 'Bold', color: '#d4847a' },
  ];

  const handleBookNow = () => {
    window.open(generateWhatsAppLink('3192641891', `Hi! I'd like to book an appointment at ${config?.brand || 'Abeenaz'} 💛`), '_blank');
  };

  const filteredServices = selectedCategory
    ? services.find(s => s.id === selectedCategory)?.items || []
    : services.flatMap(s => s.items);

  return (
    <div className="fixed inset-0 bg-[#0d0b07] z-50 overflow-hidden">
      {/* Gold Particles */}
      <div className="gold-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="gold-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(13,11,7,0.9)] border-b border-[rgba(201,168,76,0.1)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-serif gold-text">{config?.brand || 'Abeenaz'}</h1>
            <span className="text-[#7a6a50] text-xs hidden sm:block">{config?.tagline}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleBookNow} className="btn-gold hidden sm:flex">
              {config?.ctaText || 'Book Now'}
            </Button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#7a6a50] hover:text-[#c9a84c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-[80vh] flex items-center justify-center px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <span className="text-6xl">✨</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-serif gold-text mb-6">
                {config?.heroTitle || 'Discover Your Radiance'}
              </h1>
              <p className="text-[#7a6a50] text-lg md:text-xl mb-8">
                {config?.heroSub || 'Luxury beauty experiences crafted with care'}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#c9a84c]">{config?.statClients || '500+'}</p>
                  <p className="text-xs text-[#7a6a50]">Happy Clients</p>
                </div>
                <div className="w-px h-12 bg-[rgba(201,168,76,0.2)]" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#c9a84c]">{config?.statExp || '7+ Years'}</p>
                  <p className="text-xs text-[#7a6a50]">Experience</p>
                </div>
                <div className="w-px h-12 bg-[rgba(201,168,76,0.2)]" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#c9a84c]">{config?.statServices || '50+'}</p>
                  <p className="text-xs text-[#7a6a50]">Services</p>
                </div>
              </div>
              <Button onClick={handleBookNow} className="btn-gold text-lg px-8 py-6">
                {config?.ctaText || 'Book Your Experience'}
              </Button>
            </motion.div>
          </section>

          {/* Vibe Search */}
          <section className="py-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-8">
                How do you want to feel today?
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {vibes.map((vibe) => (
                  <motion.button
                    key={vibe.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)}
                    className={`px-6 py-4 rounded-2xl glass-card transition-all ${
                      selectedVibe === vibe.id
                        ? 'border-2'
                        : 'hover:border-[rgba(201,168,76,0.4)]'
                    }`}
                    style={{
                      borderColor: selectedVibe === vibe.id ? vibe.color : undefined,
                    }}
                  >
                    <span className="text-3xl block mb-2">{vibe.emoji}</span>
                    <span className="text-[#f5f0e8] text-sm">{vibe.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Services */}
          <section className="py-20 px-4 bg-[rgba(201,168,76,0.02)]">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-4">
                  Services & Pricing
                </h2>
                <p className="text-[#7a6a50]">Premium beauty services for every occasion</p>
              </motion.div>

              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {services.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === category.id
                        ? 'btn-gold'
                        : 'glass-card text-[#7a6a50] hover:text-[#f5f0e8]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <span className="text-[#f5f0e8]">{service.name}</span>
                    <span className="text-[#c9a84c] font-medium">Rs.{service.price.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Lookbook */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-4">
                  Lookbook
                </h2>
                <p className="text-[#7a6a50]">Get inspired by our signature looks</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {lookbook.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(139,105,20,0.2)] flex items-center justify-center">
                          <span className="text-6xl">{item.emoji}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,11,7,0.9)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div>
                          <p className="text-[#c9a84c] font-medium">Get This Look</p>
                          <p className="text-[#f5f0e8] text-sm">Rs.{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[#f5f0e8] font-medium">{item.title}</p>
                      <p className="text-[#7a6a50] text-sm">{item.service}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Loyalty Program */}
          <section className="py-20 px-4 bg-[rgba(201,168,76,0.02)]">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-4">
                  Loyalty Rewards
                </h2>
                <p className="text-[#7a6a50]">Earn points with every visit</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-4 mb-12">
                {shopItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <Gift className="w-10 h-10 text-[#c9a84c] mx-auto mb-4" />
                    <p className="text-[#f5f0e8] font-medium mb-2">{item.name}</p>
                    <p className="text-[#7a6a50] text-sm mb-3">{item.desc}</p>
                    <span className="text-[#c9a84c] font-semibold">{item.points} pts</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Rank Tiers */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-4">
                  Membership Tiers
                </h2>
                <p className="text-[#7a6a50]">Unlock exclusive benefits as you grow with us</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {RANK_CONFIGS.map((tier, idx) => (
                  <motion.div
                    key={tier.rank}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-4 text-center"
                  >
                    <span className="text-3xl block mb-2">{tier.emoji}</span>
                    <p className="text-[#f5f0e8] font-medium mb-1">{tier.label}</p>
                    <p className="text-[#7a6a50] text-xs mb-2">
                      Rs.{tier.lifetimeMin.toLocaleString()}+ lifetime
                    </p>
                    <p className="text-[#c9a84c] text-sm">
                      {tier.discount}% discount
                    </p>
                    {tier.birthdayBonus > 0 && (
                      <p className="text-[#e8a4b8] text-xs mt-1">
                        +{tier.birthdayBonus}% birthday
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="py-20 px-4 bg-[rgba(201,168,76,0.02)]">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-6">
                  About {config?.brand || 'Abeenaz'}
                </h2>
                <p className="text-[#7a6a50] text-lg mb-8">
                  {config?.aboutText || 'At Abeenaz, we believe every woman deserves to feel beautiful.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="glass-card p-4">
                    <Heart className="w-6 h-6 text-[#e8a4b8] mx-auto mb-2" />
                    <p className="text-[#f5f0e8] text-sm">Passion</p>
                  </div>
                  <div className="glass-card p-4">
                    <Star className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />
                    <p className="text-[#f5f0e8] text-sm">Excellence</p>
                  </div>
                  <div className="glass-card p-4">
                    <Users className="w-6 h-6 text-[#9bb8d4] mx-auto mb-2" />
                    <p className="text-[#f5f0e8] text-sm">Community</p>
                  </div>
                  <div className="glass-card p-4">
                    <Sparkles className="w-6 h-6 text-[#4ade80] mx-auto mb-2" />
                    <p className="text-[#f5f0e8] text-sm">Innovation</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-serif text-[#f5f0e8] mb-4">
                  Visit Us
                </h2>
              </motion.div>

              <div className="glass-card p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-[#c9a84c] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#f5f0e8] font-medium mb-1">Address</p>
                        <p className="text-[#7a6a50]">{config?.address || 'DHA Phase 6, Karachi, Pakistan'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-[#c9a84c] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#f5f0e8] font-medium mb-1">Contact</p>
                        <p className="text-[#7a6a50]">{config?.contact || '+92 319 264 1891'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-[#c9a84c] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#f5f0e8] font-medium mb-1">Hours</p>
                        <p className="text-[#7a6a50]">{config?.hours || 'Mon-Sat: 10AM - 8PM'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <Button onClick={handleBookNow} className="btn-gold w-full py-6 text-lg">
                      {config?.ctaText || 'Book Your Experience'}
                    </Button>
                    <p className="text-[#7a6a50] text-sm mt-4">Est. {config?.estYear || '2018'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 px-4 border-t border-[rgba(201,168,76,0.1)]">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-xl font-serif gold-text mb-2">{config?.brand || 'Abeenaz Beauty Parlour'}</p>
              <p className="text-[#7a6a50] text-sm">Where Elegance Meets Excellence</p>
              <p className="text-[#7a6a50] text-xs mt-4">© {new Date().getFullYear()} All rights reserved</p>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </div>
  );
}
