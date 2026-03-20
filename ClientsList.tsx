'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientsStore, useStaffStore } from '@/lib/store';
import { Client, RANK_CONFIGS, Rank } from '@/lib/types';
import { getMaintenanceStatus, generateWhatsAppLink, formatDate } from '@/lib/db-storage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Phone, Gift, Lock, AlertTriangle, Edit, Trash2, MessageCircle, Plus, X } from 'lucide-react';

interface ClientsListProps {
  onSelectClient: (client: Client) => void;
  onBillForClient: (client: Client) => void;
}

export function ClientsList({ onSelectClient, onBillForClient }: ClientsListProps) {
  const { clients, refreshClients, removeClient, updateClient } = useClientsStore();
  const { staff, refreshStaff } = useStaffStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    birthday: '',
    notes: '',
    staffId: '',
  });

  useEffect(() => {
    refreshClients();
    refreshStaff();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const term = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  }, [clients, search]);

  const getRank = (client: Client): Rank => {
    if (client.rankLocked && client.demotedFrom) return client.demotedFrom;
    let rank: Rank = 'new';
    for (const config of RANK_CONFIGS) {
      if (client.lifetimeSpend >= config.lifetimeMin) {
        rank = config.rank;
      }
    }
    return rank;
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setEditData({
      name: client.name,
      birthday: client.birthday || '',
      notes: client.notes || '',
      staffId: client.staffId || '',
    });
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedClient) return;
    const updated = {
      ...selectedClient,
      name: editData.name,
      birthday: editData.birthday || undefined,
      notes: editData.notes || undefined,
      staffId: editData.staffId || undefined,
    };
    updateClient(updated);
    setSelectedClient(updated);
    setEditMode(false);
  };

  const handleDeleteClient = () => {
    if (!selectedClient) return;
    if (confirm(`Delete ${selectedClient.name}? This cannot be undone.`)) {
      removeClient(selectedClient.phone);
      setShowModal(false);
      setSelectedClient(null);
    }
  };

  const toggleRankLock = () => {
    if (!selectedClient) return;
    const updated = {
      ...selectedClient,
      rankLocked: !selectedClient.rankLocked,
      demotedFrom: !selectedClient.rankLocked ? getRank(selectedClient) : undefined,
    };
    updateClient(updated);
    setSelectedClient(updated);
  };

  const renderMaintenanceRing = (client: Client) => {
    const status = getMaintenanceStatus(client);
    const rank = getRank(client);
    const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
    
    if (config.monthlyMin === 0) return null;
    
    const circumference = 2 * Math.PI * 16;
    const dashOffset = circumference - (status.percent / 100) * circumference;

    return (
      <svg className="w-10 h-10 maintenance-ring" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="rgba(201,168,76,0.1)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke={status.color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text">Clients</h1>
            <p className="text-[#7a6a50] text-sm">{clients.length} clients registered</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="btn-gold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6a50]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="pl-10 bg-[rgba(201,168,76,0.05)] border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
          />
        </div>
      </div>

      {/* Clients List */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-3">
          <AnimatePresence>
            {filteredClients.map((client, idx) => {
              const rank = getRank(client);
              const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
              const maintStatus = getMaintenanceStatus(client);

              return (
                <motion.div
                  key={client.phone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelectClient(client)}
                  className="glass-card p-4 cursor-pointer hover:border-[rgba(201,168,76,0.4)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Maintenance Ring */}
                    <div className="flex-shrink-0">
                      {renderMaintenanceRing(client)}
                    </div>

                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#f5f0e8] font-medium truncate">{client.name}</span>
                        <Badge className="badge-gold text-xs">
                          {config.emoji} {config.label}
                        </Badge>
                        {client.referralDiscount && !client.referralGiven && (
                          <Badge className="badge-green text-xs">
                            <Gift className="w-3 h-3 mr-1" /> Referral
                          </Badge>
                        )}
                        {client.rankLocked && (
                          <Badge className="badge-rose text-xs">
                            <Lock className="w-3 h-3 mr-1" /> VIP
                          </Badge>
                        )}
                        {client.demoted && (
                          <Badge className="badge-red text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Demoted
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#7a6a50]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          +92 {client.phone}
                        </span>
                        <span>Reward Points: {client.loyaltyPoints}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right hidden sm:block">
                      <p className="text-[#c9a84c] font-medium">Rs.{client.lifetimeSpend.toLocaleString()}</p>
                      <p className="text-xs text-[#7a6a50]">{client.visits} visits</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#7a6a50]">No clients found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Client Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="gold-text">{selectedClient.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditMode(!editMode)}
                      className="text-[#7a6a50] hover:text-[#c9a84c]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7a6a50]">Phone</label>
                    <p className="text-[#f5f0e8]">+92 {selectedClient.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#7a6a50]">Rank</label>
                    <p className="text-[#f5f0e8]">
                      {RANK_CONFIGS.find(r => r.rank === getRank(selectedClient))?.emoji}{' '}
                      {RANK_CONFIGS.find(r => r.rank === getRank(selectedClient))?.label}
                    </p>
                  </div>
                  {editMode ? (
                    <>
                      <div>
                        <label className="text-xs text-[#7a6a50]">Name</label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#7a6a50]">Birthday</label>
                        <Input
                          type="date"
                          value={editData.birthday}
                          onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                          className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-[#7a6a50]">Notes</label>
                        <Input
                          value={editData.notes}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Allergies, preferences..."
                          className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#7a6a50]">Assigned Staff</label>
                        <select
                          value={editData.staffId}
                          onChange={(e) => setEditData({ ...editData, staffId: e.target.value })}
                          className="w-full bg-transparent border border-[rgba(201,168,76,0.2)] rounded-md px-3 py-2 text-[#f5f0e8]"
                        >
                          <option value="">None</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedClient.birthday && (
                        <div>
                          <label className="text-xs text-[#7a6a50]">Birthday</label>
                          <p className="text-[#f5f0e8]">{formatDate(selectedClient.birthday)}</p>
                        </div>
                      )}
                      {selectedClient.notes && (
                        <div className="col-span-2">
                          <label className="text-xs text-[#7a6a50]">Notes</label>
                          <p className="text-[#f5f0e8]">{selectedClient.notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">Lifetime</p>
                    <p className="text-[#c9a84c] font-semibold">Rs.{selectedClient.lifetimeSpend.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">This Month</p>
                    <p className="text-[#f5f0e8] font-semibold">
                      Rs.{(selectedClient.monthlySpend[new Date().toISOString().slice(0, 7)] || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">Visits</p>
                    <p className="text-[#f5f0e8] font-semibold">{selectedClient.visits}</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">Points</p>
                    <p className="text-[#c9a84c] font-semibold">{selectedClient.loyaltyPoints}</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">Discount</p>
                    <p className="text-[#f5f0e8] font-semibold">
                      {RANK_CONFIGS.find(r => r.rank === getRank(selectedClient))?.discount || 0}%
                    </p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-xs text-[#7a6a50]">Points Mult</p>
                    <p className="text-[#f5f0e8] font-semibold">
                      {RANK_CONFIGS.find(r => r.rank === getRank(selectedClient))?.pointsMultiplier || 1}×
                    </p>
                  </div>
                </div>

                {/* Admin Override */}
                <div className="glass-card p-4 space-y-3">
                  <h3 className="text-sm font-medium text-[#c9a84c]">Admin Override</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#f5f0e8] text-sm">Lock Rank (VIP)</p>
                      <p className="text-xs text-[#7a6a50]">Prevents automatic rank changes</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={toggleRankLock}
                      className={selectedClient.rankLocked ? 'btn-gold' : 'btn-gold-outline'}
                    >
                      {selectedClient.rankLocked ? 'Locked' : 'Lock'}
                    </Button>
                  </div>
                </div>

                {/* Visit History */}
                <div>
                  <h3 className="text-sm font-medium text-[#c9a84c] mb-3">Recent Visits</h3>
                  {selectedClient.visitLog?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedClient.visitLog.slice(0, 10).map((visit, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[rgba(201,168,76,0.05)]">
                          <div>
                            <p className="text-sm text-[#f5f0e8]">
                              {visit.services.map(s => s.name).join(', ')}
                            </p>
                            <p className="text-xs text-[#7a6a50]">
                              {formatDate(visit.date)} • {visit.billNo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[#c9a84c]">Rs.{visit.charged.toLocaleString()}</p>
                            <p className="text-xs text-[#7a6a50]">+{visit.pts} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#7a6a50] text-sm">No visit history</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[rgba(201,168,76,0.1)]">
                  {editMode ? (
                    <>
                      <Button onClick={handleSaveEdit} className="btn-gold flex-1">
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditMode(false)} variant="outline" className="btn-gold-outline flex-1">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setShowModal(false);
                          onBillForClient(selectedClient);
                        }}
                        className="btn-gold flex-1"
                      >
                        Log Visit
                      </Button>
                      <Button
                        onClick={() => window.open(generateWhatsAppLink(selectedClient.phone, 'Hi! This is Abeenaz Beauty Parlour.'), '_blank')}
                        variant="outline"
                        className="btn-gold-outline flex-1"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={handleDeleteClient}
                        variant="outline"
                        className="btn-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Modal */}
      <AddClientModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}

// Add Client Modal Component
function AddClientModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { clients, addClient } = useClientsStore();
  const { staff, refreshStaff } = useStaffStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthday: '',
    referredBy: '',
    notes: '',
    staffId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    refreshStaff();
  }, []);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      setError('Valid 10-digit phone number is required');
      return;
    }
    if (clients.find(c => c.phone === formData.phone)) {
      setError('Client with this phone already exists');
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const newClient: Client = {
      phone: formData.phone,
      name: formData.name,
      joinDate: new Date().toISOString().split('T')[0],
      birthday: formData.birthday || undefined,
      visits: 0,
      lifetimeSpend: 0,
      monthlySpend: { [currentMonth]: 0 },
      loyaltyPoints: 0,
      visitLog: [],
      redemptionLog: [],
      rankHistory: [],
      referredBy: formData.referredBy || undefined,
      referralDiscount: !!formData.referredBy,
      referralGiven: false,
      missedMonths: 0,
      notes: formData.notes || undefined,
      staffId: formData.staffId || undefined,
    };

    // Handle referral for referrer
    if (formData.referredBy) {
      const referrer = clients.find(c => c.phone === formData.referredBy);
      if (referrer) {
        referrer.referralDiscount = true;
        // Will save when addClient is called for referrer too
      }
    }

    addClient(newClient);
    setFormData({ name: '', phone: '', birthday: '', referredBy: '', notes: '', staffId: '' });
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
        <DialogHeader>
          <DialogTitle className="gold-text">Add New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-[#7a6a50]">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              placeholder="Client name"
            />
          </div>

          <div>
            <label className="text-xs text-[#7a6a50]">Phone (10 digits) *</label>
            <div className="flex items-center gap-2">
              <span className="text-[#c9a84c]">+92</span>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="flex-1 bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="3XX XXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#7a6a50]">Birthday</label>
            <Input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
            />
          </div>

          <div>
            <label className="text-xs text-[#7a6a50]">Referred By (phone)</label>
            <Input
              value={formData.referredBy}
              onChange={(e) => setFormData({ ...formData, referredBy: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              placeholder="Referrer's phone"
            />
          </div>

          <div>
            <label className="text-xs text-[#7a6a50]">Assigned Staff</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] rounded-md px-3 py-2 text-[#f5f0e8]"
            >
              <option value="">None</option>
              {staff.filter(s => s.active).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#7a6a50]">Notes</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              placeholder="Allergies, preferences..."
            />
          </div>

          {error && (
            <p className="text-[#c07070] text-sm">{error}</p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="btn-gold flex-1">
              Add Client
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="btn-gold-outline flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
