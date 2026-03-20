'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLoyaltyStore, useClientsStore, useConfigStore } from '@/lib/store';
import { LoyaltyShopItem, Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gift, Plus, Edit, Trash2, Star, Users } from 'lucide-react';

export function LoyaltyManagement() {
  const { shopItems, refreshLoyalty, addItem, updateItem, removeItem } = useLoyaltyStore();
  const { clients, refreshClients, updateClient } = useClientsStore();
  const { config, refreshConfig, updateConfig } = useConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LoyaltyShopItem | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pointsRate, setPointsRate] = useState(config?.pointsPerHundred ?? 1);
  const [formData, setFormData] = useState({
    name: '',
    points: 100,
    desc: '',
  });

  useEffect(() => {
    refreshLoyalty();
    refreshClients();
    refreshConfig();
  }, [refreshLoyalty, refreshClients, refreshConfig]);

  // Initialize pointsRate from config
  const initialPointsRate = config?.pointsPerHundred ?? 1;

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }

    if (editingItem) {
      updateItem({
        ...editingItem,
        name: formData.name,
        points: formData.points,
        desc: formData.desc,
      });
    } else {
      const newItem: LoyaltyShopItem = {
        id: `l${Date.now()}`,
        name: formData.name,
        points: formData.points,
        desc: formData.desc,
      };
      addItem(newItem);
    }

    setFormData({ name: '', points: 100, desc: '' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item: LoyaltyShopItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      points: item.points,
      desc: item.desc,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this reward?')) {
      removeItem(id);
    }
  };

  const handleRedeem = (item: LoyaltyShopItem) => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    if (selectedClient.loyaltyPoints < item.points) {
      alert(`${selectedClient.name} doesn't have enough points`);
      return;
    }

    const updatedClient = {
      ...selectedClient,
      loyaltyPoints: selectedClient.loyaltyPoints - item.points,
      redemptionLog: [
        { date: new Date().toISOString(), item: item.name, points: item.points },
        ...selectedClient.redemptionLog,
      ],
    };
    updateClient(updatedClient);
    setSelectedClient(updatedClient);
    alert(`Redeemed ${item.name} for ${selectedClient.name}!`);
  };

  const handleUpdatePointsRate = () => {
    updateConfig({ pointsPerHundred: pointsRate });
    alert('Points rate updated!');
  };

  const clientsWithPoints = clients.filter(c => c.loyaltyPoints > 0).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
              <Gift className="w-8 h-8" />
              Loyalty Program
            </h1>
            <p className="text-[#7a6a50] text-sm">Manage rewards and points</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowRedeemModal(true)} variant="outline" className="btn-gold-outline">
              <Star className="w-4 h-4 mr-2" />
              Redeem Points
            </Button>
            <Button onClick={() => setShowModal(true)} className="btn-gold">
              <Plus className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Points Rate */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Points Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-[#7a6a50] mb-2">Points earned per Rs.100 spent</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={pointsRate}
                      onChange={(e) => setPointsRate(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                    />
                    <span className="text-[#7a6a50]">pts per Rs.100</span>
                    <Button onClick={handleUpdatePointsRate} size="sm" className="btn-gold">
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Shop */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Rewards Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {shopItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center">
                          <Gift className="w-6 h-6 text-[#0d0b07]" />
                        </div>
                        <div>
                          <p className="text-[#f5f0e8] font-medium">{item.name}</p>
                          <p className="text-[#7a6a50] text-sm">{item.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <Badge className="badge-gold">{item.points} pts</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="text-[#7a6a50] hover:text-[#c9a84c]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="text-[#c07070] hover:text-[#e08080]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {shopItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#7a6a50]">No rewards added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Points Earners */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c9a84c]" />
                Top Points Earners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientsWithPoints.slice(0, 10).map((client, idx) => (
                  <div key={client.phone} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(201,168,76,0.05)]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#7a6a50] w-6">{idx + 1}.</span>
                      <span className="text-[#f5f0e8]">{client.name}</span>
                    </div>
                    <span className="text-[#c9a84c] font-medium">{client.loyaltyPoints} pts</span>
                  </div>
                ))}

                {clientsWithPoints.length === 0 && (
                  <p className="text-[#7a6a50] text-center py-4">No clients with points yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text">
              {editingItem ? 'Edit Reward' : 'Add Reward'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#7a6a50]">Reward Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="e.g., Free Manicure"
              />
            </div>

            <div>
              <label className="text-xs text-[#7a6a50]">Points Required</label>
              <Input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              />
            </div>

            <div>
              <label className="text-xs text-[#7a6a50]">Description</label>
              <Input
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="Short description"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="btn-gold flex-1">
                {editingItem ? 'Save Changes' : 'Add Reward'}
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  setFormData({ name: '', points: 100, desc: '' });
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

      {/* Redeem Points Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text">Redeem Points</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#7a6a50]">Select Client</label>
              <select
                value={selectedClient?.phone || ''}
                onChange={(e) => {
                  const c = clients.find(c => c.phone === e.target.value);
                  setSelectedClient(c || null);
                }}
                className="w-full bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] rounded-md px-3 py-2 text-[#f5f0e8]"
              >
                <option value="">Select a client...</option>
                {clientsWithPoints.map(c => (
                  <option key={c.phone} value={c.phone}>
                    {c.name} ({c.loyaltyPoints} pts)
                  </option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div>
                <p className="text-xs text-[#7a6a50] mb-2">Available Points: <span className="text-[#c9a84c]">{selectedClient.loyaltyPoints}</span></p>
                <div className="space-y-2">
                  {shopItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        selectedClient.loyaltyPoints >= item.points
                          ? 'glass-card cursor-pointer hover:border-[rgba(201,168,76,0.4)]'
                          : 'bg-[rgba(122,106,80,0.1)] opacity-50'
                      }`}
                      onClick={() => selectedClient.loyaltyPoints >= item.points && handleRedeem(item)}
                    >
                      <div>
                        <p className="text-[#f5f0e8]">{item.name}</p>
                        <p className="text-xs text-[#7a6a50]">{item.desc}</p>
                      </div>
                      <Badge className={selectedClient.loyaltyPoints >= item.points ? 'badge-gold' : 'badge-red'}>
                        {item.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
