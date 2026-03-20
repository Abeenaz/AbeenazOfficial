'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInventoryStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

export function InventoryManagement() {
  const { inventory, refreshInventory, addItem, updateItem, removeItem } = useInventoryStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    qty: 0,
    lowAt: 5,
    unit: 'pcs',
  });

  useEffect(() => {
    refreshInventory();
  }, []);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }

    if (editingItem) {
      updateItem({
        ...editingItem,
        name: formData.name,
        qty: formData.qty,
        lowAt: formData.lowAt,
        unit: formData.unit,
      });
    } else {
      const newItem: InventoryItem = {
        id: `i${Date.now()}`,
        name: formData.name,
        qty: formData.qty,
        lowAt: formData.lowAt,
        unit: formData.unit,
      };
      addItem(newItem);
    }

    setFormData({ name: '', qty: 0, lowAt: 5, unit: 'pcs' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      qty: item.qty,
      lowAt: item.lowAt,
      unit: item.unit,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this item?')) {
      removeItem(id);
    }
  };

  const isLowStock = (item: InventoryItem) => item.qty <= item.lowAt;

  const sortedInventory = [...inventory].sort((a, b) => {
    // Low stock items first
    const aLow = isLowStock(a) ? 0 : 1;
    const bLow = isLowStock(b) ? 0 : 1;
    return aLow - bLow;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
              <Package className="w-8 h-8" />
              Inventory
            </h1>
            <p className="text-[#7a6a50] text-sm">
              {inventory.filter(i => isLowStock(i)).length} items low stock
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          <div className="grid gap-4">
            {sortedInventory.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-4 ${isLowStock(item) ? 'border-[rgba(239,68,68,0.4)]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isLowStock(item) ? 'bg-[rgba(239,68,68,0.2)]' : 'bg-[rgba(201,168,76,0.1)]'
                    }`}>
                      {isLowStock(item) ? (
                        <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
                      ) : (
                        <Package className="w-6 h-6 text-[#c9a84c]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[#f5f0e8] font-medium">{item.name}</p>
                      <p className="text-[#7a6a50] text-sm">Low at: {item.lowAt} {item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-[#f5f0e8]">
                        {item.qty}
                      </p>
                      <p className="text-xs text-[#7a6a50]">{item.unit}</p>
                    </div>
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

            {inventory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#7a6a50]">No inventory items added yet</p>
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
              {editingItem ? 'Edit Item' : 'Add Inventory Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#7a6a50]">Item Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                placeholder="e.g., Hair Color Tubes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#7a6a50]">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                  className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                />
              </div>
              <div>
                <label className="text-xs text-[#7a6a50]">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  placeholder="pcs, jars, etc."
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#7a6a50]">Low Stock Alert At</label>
              <Input
                type="number"
                min="0"
                value={formData.lowAt}
                onChange={(e) => setFormData({ ...formData, lowAt: parseInt(e.target.value) || 0 })}
                className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="btn-gold flex-1">
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  setFormData({ name: '', qty: 0, lowAt: 5, unit: 'pcs' });
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
