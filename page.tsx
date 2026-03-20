'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';
import { ClientsList } from '@/components/ClientsList';
import { BillMaker } from '@/components/BillMaker';
import { Broadcast } from '@/components/Broadcast';
import { StaffManagement } from '@/components/StaffManagement';
import { InventoryManagement } from '@/components/InventoryManagement';
import { LoyaltyManagement } from '@/components/LoyaltyManagement';
import { RevenueTracking } from '@/components/RevenueTracking';
import { AlertsPanel } from '@/components/AlertsPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { CustomizePanel } from '@/components/CustomizePanel';
import { ExplorePage } from '@/components/ExplorePage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/lib/types';
import {
  Home, Users, Receipt, MessageCircle, UserPlus, IndianRupee,
  Bell, User, Package, Gift, Palette, Shield, LogOut, Sparkles, Menu, X
} from 'lucide-react';

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'bill', label: 'Bill Maker', icon: Receipt },
  { id: 'broadcast', label: 'Broadcast', icon: MessageCircle },
  { id: 'revenue', label: 'Revenue', icon: IndianRupee },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'staff', label: 'Staff', icon: User },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'loyalty', label: 'Loyalty', icon: Gift },
  { id: 'customize', label: 'Customize', icon: Palette },
  { id: 'admins', label: 'Admins', icon: Shield },
];

export default function Home() {
  const { isAuthenticated, needsPinSet, logout, adminPhone } = useAuthStore();
  const { currentTab, setCurrentTab, showExplore, setShowExplore, setSelectedClient } = useAppStore();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [billClient, setBillClient] = useState<Client | null>(null);

  // Gold particles for background
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 10,
  }));

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    setShowMobileNav(false);
  };

  const handleBillForClient = (client: Client) => {
    setBillClient(client);
    setCurrentTab('bill');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Show login if not authenticated or needs PIN setup
  if (!isAuthenticated || needsPinSet) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'clients':
        return <ClientsList onSelectClient={() => {}} onBillForClient={handleBillForClient} />;
      case 'bill':
        return <BillMaker preselectedClient={billClient} onComplete={() => setBillClient(null)} />;
      case 'broadcast':
        return <Broadcast />;
      case 'revenue':
        return <RevenueTracking />;
      case 'alerts':
        return <AlertsPanel />;
      case 'staff':
        return <StaffManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'loyalty':
        return <LoyaltyManagement />;
      case 'customize':
        return <CustomizePanel />;
      case 'admins':
        return <AdminPanel />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b07] flex flex-col">
      {/* Gold Particles Background */}
      <div className="gold-particles pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 backdrop-blur-xl bg-[rgba(13,11,7,0.95)] border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="w-10 h-10 rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#c9a84c]"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-serif gold-text">Abeenaz</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowExplore(true)}
              variant="outline"
              className="btn-gold-outline"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Explore
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              variant="ghost"
              className="text-[#7a6a50]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-[rgba(13,11,7,0.95)] backdrop-blur-xl pt-20"
          >
            <nav className="p-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentTab === item.id
                      ? 'bg-gradient-to-r from-[rgba(201,168,76,0.2)] to-transparent text-[#c9a84c]'
                      : 'text-[#7a6a50] hover:text-[#f5f0e8] hover:bg-[rgba(201,168,76,0.1)]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-[rgba(201,168,76,0.1)] bg-[rgba(13,11,7,0.5)]">
          {/* Logo */}
          <div className="p-6 border-b border-[rgba(201,168,76,0.1)]">
            <h1 className="text-2xl font-serif gold-text">Abeenaz</h1>
            <p className="text-[#7a6a50] text-xs mt-1">Beauty Parlour Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  currentTab === item.id
                    ? 'bg-gradient-to-r from-[rgba(201,168,76,0.2)] to-transparent text-[#c9a84c] border-l-2 border-[#c9a84c]'
                    : 'text-[#7a6a50] hover:text-[#f5f0e8] hover:bg-[rgba(201,168,76,0.05)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[rgba(201,168,76,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center">
                <User className="w-5 h-5 text-[#0d0b07]" />
              </div>
              <div>
                <p className="text-[#f5f0e8] text-sm">Admin</p>
                <p className="text-[#7a6a50] text-xs">+92 {adminPhone?.slice(0, 3)} {adminPhone?.slice(3)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowExplore(true)}
                variant="outline"
                className="btn-gold-outline flex-1"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Explore
              </Button>
              <Button
                size="sm"
                onClick={handleLogout}
                variant="ghost"
                className="text-[#7a6a50] hover:text-[#c07070]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Explore Page */}
      <AnimatePresence>
        {showExplore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ExplorePage onClose={() => setShowExplore(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
