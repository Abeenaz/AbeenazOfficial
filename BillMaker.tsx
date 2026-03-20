'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBillStore, useClientsStore, useStaffStore, useServicesStore } from '@/lib/store';
import { Client, RANK_CONFIGS, Rank } from '@/lib/types';
import { generateWhatsAppLink, formatDate } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Minus, Trash2, Check, MessageCircle, Receipt, User, Sparkles } from 'lucide-react';

interface BillMakerProps {
  preselectedClient?: Client | null;
  onComplete?: () => void;
}

export function BillMaker({ preselectedClient, onComplete }: BillMakerProps) {
  const { clients, refreshClients } = useClientsStore();
  const { staff, refreshStaff } = useStaffStore();
  const { services, refreshServices } = useServicesStore();
  const {
    selectedServices,
    billClient,
    billStaff,
    setBillClient,
    setBillStaff,
    addService,
    removeService,
    updateServiceQty,
    clearBill,
    calculateTotals,
    completeBill,
  } = useBillStore();

  const [clientSearch, setClientSearch] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [completedBill, setCompletedBill] = useState<{ billNo: string; message: string } | null>(null);

  useEffect(() => {
    refreshClients();
    refreshStaff();
    refreshServices();
  }, []);

  useEffect(() => {
    if (preselectedClient) {
      setBillClient(preselectedClient);
    }
  }, [preselectedClient]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 10);
    const term = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term)
    ).slice(0, 10);
  }, [clients, clientSearch]);

  const totals = calculateTotals();

  const getRank = (client: Client): Rank => {
    let rank: Rank = 'new';
    for (const config of RANK_CONFIGS) {
      if (client.lifetimeSpend >= config.lifetimeMin) {
        rank = config.rank;
      }
    }
    return rank;
  };

  const handleCompleteBill = () => {
    const result = completeBill();
    if (result.success) {
      setCompletedBill(result);
      setShowPreview(false);
    } else {
      alert(result.message);
    }
  };

  const handleSendWhatsApp = () => {
    if (!billClient || !completedBill) return;
    window.open(generateWhatsAppLink(billClient.phone, completedBill.message), '_blank');
  };

  const handleNewBill = () => {
    clearBill();
    setCompletedBill(null);
    setShowPreview(false);
    onComplete?.();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
          <Receipt className="w-8 h-8" />
          Bill Maker
        </h1>
        <p className="text-[#7a6a50] text-sm">Create bills and track visits</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Service Selection */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Client Selection */}
          <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
            <label className="text-xs text-[#7a6a50] mb-2 block">Select Client</label>
            {billClient ? (
              <div className="flex items-center justify-between p-3 glass-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#0d0b07]" />
                  </div>
                  <div>
                    <p className="text-[#f5f0e8] font-medium">{billClient.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="badge-gold text-xs">
                        {RANK_CONFIGS.find(r => r.rank === getRank(billClient))?.emoji}{' '}
                        {RANK_CONFIGS.find(r => r.rank === getRank(billClient))?.label}
                      </Badge>
                      {billClient.referralDiscount && !billClient.referralGiven && (
                        <Badge className="badge-green text-xs">🎁 Referral</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setBillClient(null)}
                  className="text-[#7a6a50] hover:text-[#c9a84c]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6a50]" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  onFocus={() => setShowClientSearch(true)}
                  placeholder="Search by name or phone..."
                  className="pl-10 bg-[rgba(201,168,76,0.05)] border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                />
                
                <AnimatePresence>
                  {showClientSearch && filteredClients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 glass-card p-2 max-h-60 overflow-y-auto"
                    >
                      {filteredClients.map((client) => (
                        <div
                          key={client.phone}
                          onClick={() => {
                            setBillClient(client);
                            setShowClientSearch(false);
                            setClientSearch('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(201,168,76,0.1)] cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-[#f5f0e8]">{client.name}</p>
                            <p className="text-xs text-[#7a6a50]">+92 {client.phone}</p>
                          </div>
                          <Badge className="badge-gold text-xs">
                            {RANK_CONFIGS.find(r => r.rank === getRank(client))?.emoji}{' '}
                            {RANK_CONFIGS.find(r => r.rank === getRank(client))?.label}
                          </Badge>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Staff Selection */}
          <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
            <label className="text-xs text-[#7a6a50] mb-2 block">Assign Staff (Optional)</label>
            <select
              value={billStaff?.id || ''}
              onChange={(e) => {
                const s = staff.find(st => st.id === e.target.value);
                setBillStaff(s || null);
              }}
              className="w-full bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] rounded-md px-3 py-2 text-[#f5f0e8]"
            >
              <option value="">No staff assigned</option>
              {staff.filter(s => s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* Services by Category */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {services.map((category) => (
                <div key={category.id}>
                  <h3 className="text-sm font-medium text-[#c9a84c] mb-3">{category.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.items.map((service) => {
                      const isSelected = selectedServices.find(s => s.serviceId === service.id);
                      return (
                        <motion.button
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addService(category.id, service.id, service.name, service.price)}
                          className={`p-3 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[rgba(201,168,76,0.3)] to-[rgba(139,105,20,0.3)] border border-[#c9a84c]'
                              : 'glass-card hover:border-[rgba(201,168,76,0.4)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[#f5f0e8]">{service.name}</span>
                            <span className="text-[#c9a84c]">Rs.{service.price.toLocaleString()}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#c9a84c] mt-1" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Bill Preview */}
        <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-[rgba(201,168,76,0.1)] flex flex-col">
          {/* Selected Services */}
          <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
            <h3 className="text-sm font-medium text-[#c9a84c] mb-3">Selected Services</h3>
            {selectedServices.length === 0 ? (
              <p className="text-[#7a6a50] text-sm text-center py-4">No services selected</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedServices.map((service) => (
                  <div key={service.serviceId} className="flex items-center justify-between p-2 glass-card">
                    <div className="flex-1">
                      <p className="text-[#f5f0e8] text-sm">{service.name}</p>
                      <p className="text-xs text-[#7a6a50]">Rs.{service.price.toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateServiceQty(service.serviceId, service.qty - 1)}
                        className="w-8 h-8 p-0 text-[#7a6a50] hover:text-[#c9a84c]"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-[#f5f0e8] w-8 text-center">{service.qty}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateServiceQty(service.serviceId, service.qty + 1)}
                        className="w-8 h-8 p-0 text-[#7a6a50] hover:text-[#c9a84c]"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeService(service.serviceId)}
                        className="w-8 h-8 p-0 text-[#c07070] hover:text-[#e08080]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calculations */}
          <div className="p-4 space-y-3 border-b border-[rgba(201,168,76,0.1)]">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6a50]">Subtotal</span>
              <span className="text-[#f5f0e8]">Rs.{totals.subtotal.toLocaleString()}</span>
            </div>
            
            {totals.rankDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7a6a50]">Rank Discount ({totals.rankDiscount}%)</span>
                <span className="text-[#4ade80]">-Rs.{Math.round(totals.subtotal * totals.rankDiscount / 100).toLocaleString()}</span>
              </div>
            )}
            
            {totals.referralDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7a6a50]">Referral Bonus 🎁 (10%)</span>
                <span className="text-[#4ade80]">-Rs.{Math.round(totals.subtotal * totals.referralDiscount / 100).toLocaleString()}</span>
              </div>
            )}
            
            {totals.birthdayBonus > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7a6a50]">Birthday Bonus 🎂 (5%)</span>
                <span className="text-[#4ade80]">-Rs.{Math.round(totals.subtotal * totals.birthdayBonus / 100).toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[rgba(201,168,76,0.1)]">
              <span className="text-[#c9a84c]">Total</span>
              <span className="text-[#c9a84c]">Rs.{totals.total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6a50]">Points to Earn</span>
              <span className="text-[#f5f0e8]">+{totals.points} pts</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 mt-auto">
            <Button
              onClick={() => setShowPreview(true)}
              disabled={!billClient || selectedServices.length === 0}
              className="w-full btn-gold py-4 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Preview & Complete
            </Button>
          </div>
        </div>
      </div>

      {/* Bill Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text text-center">Bill Preview</DialogTitle>
          </DialogHeader>

          {billClient && (
            <div className="glass-card p-4 gold-glow">
              {/* Header */}
              <div className="text-center border-b border-[rgba(201,168,76,0.2)] pb-4 mb-4">
                <h2 className="text-xl font-serif gold-text">✦ ABEENAZ BEAUTY PARLOUR ✦</h2>
              </div>

              {/* Client Info */}
              <div className="mb-4">
                <p className="text-[#f5f0e8] font-medium">{billClient.name}</p>
                <p className="text-xs text-[#7a6a50]">+92 {billClient.phone}</p>
              </div>

              {/* Services */}
              <div className="space-y-2 mb-4">
                {selectedServices.map((service) => (
                  <div key={service.serviceId} className="flex justify-between text-sm">
                    <span className="text-[#f5f0e8]">{service.name} (×{service.qty})</span>
                    <span className="text-[#f5f0e8]">Rs.{(service.price * service.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[rgba(201,168,76,0.2)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6a50]">Subtotal</span>
                  <span className="text-[#f5f0e8]">Rs.{totals.subtotal.toLocaleString()}</span>
                </div>
                
                {(totals.rankDiscount + totals.referralDiscount + totals.birthdayBonus) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a6a50]">Discounts</span>
                    <span className="text-[#4ade80]">-Rs.{totals.totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-[#c9a84c]">Total</span>
                  <span className="text-[#c9a84c]">Rs.{totals.total.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6a50]">Points Earned</span>
                  <span className="text-[#f5f0e8]">+{totals.points} pts</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4 pt-4 border-t border-[rgba(201,168,76,0.2)]">
                <p className="text-xs text-[#7a6a50]">Thank you, {billClient.name}! See you soon 💛</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCompleteBill} className="btn-gold flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Complete
                </Button>
                <Button onClick={() => setShowPreview(false)} variant="outline" className="btn-gold-outline flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completed Bill Modal */}
      <Dialog open={!!completedBill} onOpenChange={() => setCompletedBill(null)}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text text-center">✓ Bill Completed</DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center">
              <Check className="w-8 h-8 text-[#0d0b07]" />
            </div>
            <p className="text-[#f5f0e8] mb-2">Bill #{completedBill?.billNo}</p>
            <p className="text-[#7a6a50] text-sm mb-6">Visit logged successfully</p>

            <div className="flex gap-2">
              <Button onClick={handleSendWhatsApp} className="btn-gold flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send on WhatsApp
              </Button>
              <Button onClick={handleNewBill} variant="outline" className="btn-gold-outline flex-1">
                New Bill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
