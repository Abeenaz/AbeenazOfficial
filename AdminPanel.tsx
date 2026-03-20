'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { addAdmin, removeAdmin, getDB } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Key, Plus, Trash2, Shield, User } from 'lucide-react';

export function AdminPanel() {
  const { adminPhone, isAuthenticated } = useAuthStore();
  const [admins, setAdmins] = useState<string[]>(() => getDB().admins);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [error, setError] = useState('');

  const handleAddAdmin = () => {
    if (!newAdminPhone.trim() || newAdminPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (admins.includes(newAdminPhone)) {
      setError('This phone is already an admin');
      return;
    }

    // Create client record for admin if doesn't exist
    const db = getDB();
    if (!db.clients[newAdminPhone]) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      db.clients[newAdminPhone] = {
        phone: newAdminPhone,
        name: `Admin ${newAdminPhone.slice(-4)}`,
        joinDate: new Date().toISOString().split('T')[0],
        visits: 0,
        lifetimeSpend: 0,
        monthlySpend: { [currentMonth]: 0 },
        loyaltyPoints: 0,
        visitLog: [],
        redemptionLog: [],
        rankHistory: [],
        missedMonths: 0,
        pinSet: false,
      };
    }
    
    addAdmin(newAdminPhone);
    setNewAdminPhone('');
    setError('');
    setShowAddModal(false);
    // Reload admins
    setAdmins(getDB().admins);
  };

  const handleRemoveAdmin = (phone: string) => {
    if (phone === adminPhone) {
      alert("You cannot remove yourself as admin");
      return;
    }
    if (admins.length <= 1) {
      alert("There must be at least one admin");
      return;
    }
    if (confirm(`Remove admin ${phone}?`)) {
      removeAdmin(phone);
      setAdmins(getDB().admins);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Admins
            </h1>
            <p className="text-[#7a6a50] text-sm">Manage admin access</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Current Admin Info */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Your Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#0d0b07]" />
                </div>
                <div>
                  <p className="text-[#f5f0e8]">Logged in as Admin</p>
                  <p className="text-[#7a6a50] text-sm">+92 {adminPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin List */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">All Admins ({admins.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admins.map((phone, idx) => (
                  <motion.div
                    key={phone}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 glass-card"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#c9a84c]" />
                      <div>
                        <p className="text-[#f5f0e8]">+92 {phone}</p>
                        {phone === adminPhone && (
                          <Badge className="badge-gold text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                    {phone !== adminPhone && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAdmin(phone)}
                        className="text-[#c07070] hover:text-[#e08080]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Admin Login Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                <p className="text-[#f5f0e8] font-medium">Default PIN</p>
                <p className="text-[#7a6a50]">Last 4 digits of phone number</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                <p className="text-[#f5f0e8] font-medium">First Login</p>
                <p className="text-[#7a6a50]">Must set a new PIN (cannot be default)</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                <p className="text-[#f5f0e8] font-medium">Security</p>
                <p className="text-[#7a6a50]">PIN is stored locally and never shared</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Add Admin Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text">Add New Admin</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#7a6a50]">Phone Number (10 digits)</label>
              <div className="flex items-center gap-2">
                <span className="text-[#c9a84c]">+92</span>
                <Input
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  placeholder="3XX XXX XXXX"
                />
              </div>
            </div>

            {error && <p className="text-[#c07070] text-sm">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={handleAddAdmin} className="btn-gold flex-1">
                Add Admin
              </Button>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminPhone('');
                  setError('');
                }}
                variant="outline"
                className="btn-gold-outline flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
