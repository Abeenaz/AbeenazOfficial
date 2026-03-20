'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStaffStore } from '@/lib/store';
import { Staff } from '@/lib/types';
import { getCurrentMonthKey } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash2, DollarSign } from 'lucide-react';

export function StaffManagement() {
  const { staff, refreshStaff, addStaff, updateStaff, removeStaff } = useStaffStore();
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    commissionPct: 15,
  });

  useEffect(() => {
    refreshStaff();
  }, []);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      alert('Name and role are required');
      return;
    }

    if (editingStaff) {
      updateStaff({
        ...editingStaff,
        name: formData.name,
        role: formData.role,
        commissionPct: formData.commissionPct,
      });
    } else {
      const newStaff: Staff = {
        id: `st${Date.now()}`,
        name: formData.name,
        role: formData.role,
        commissionPct: formData.commissionPct,
        earnings: {},
        active: true,
      };
      addStaff(newStaff);
    }

    setFormData({ name: '', role: '', commissionPct: 15 });
    setEditingStaff(null);
    setShowModal(false);
  };

  const handleEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      role: s.role,
      commissionPct: s.commissionPct,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this staff member?')) {
      removeStaff(id);
    }
  };

  const toggleActive = (s: Staff) => {
    updateStaff({ ...s, active: !s.active });
  };

  const currentMonth = getCurrentMonthKey();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
              <Users className="w-8 h-8" />
              Staff
            </h1>
            <p className="text-[#7a6a50] text-sm">{staff.length} team members</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          <div className="grid gap-4">
            {staff.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-4 ${!s.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center">
                      <span className="text-[#0d0b07] font-semibold text-lg">
                        {s.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[#f5f0e8] font-medium">{s.name}</p>
                        {!s.active && (
                          <Badge className="badge-red text-xs">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-[#7a6a50] text-sm">{s.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-[#7a6a50]">Commission</p>
                      <p className="text-[#c9a84c] font-medium">{s.commissionPct}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#7a6a50]">This Month</p>
                      <p className="text-[#f5f0e8] font-medium">
                        Rs.{(s.earnings[currentMonth] || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(s)}
                        className="text-[#7a6a50] hover:text-[#c9a84c]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(s)}
                        className={s.active ? 'text-[#7a6a50]' : 'text-[#4ade80]'}
                      >
                        {s.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(s.id)}
                        className="text-[#c07070] hover:text-[#e08080]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {staff.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#7a6a50]">No staff members added yet</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text">
              {editingStaff ? 'Edit Staff' : 'Add Staff Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#7a6a50]">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="Staff name"
              />
            </div>

            <div>
              <label className="text-xs text-[#7a6a50]">Role</label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="e.g., Senior Stylist"
              />
            </div>

            <div>
              <label className="text-xs text-[#7a6a50]">Commission %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.commissionPct}
                onChange={(e) => setFormData({ ...formData, commissionPct: parseInt(e.target.value) || 0 })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="btn-gold flex-1">
                {editingStaff ? 'Save Changes' : 'Add Staff'}
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false);
                  setEditingStaff(null);
                  setFormData({ name: '', role: '', commissionPct: 15 });
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
