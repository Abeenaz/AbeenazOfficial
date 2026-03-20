'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConfigStore, useServicesStore, useLookbookStore } from '@/lib/store';
import { Config, ServiceCategory, LookbookItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Save, Plus, Edit, Trash2, Image, Sparkles } from 'lucide-react';

export function CustomizePanel() {
  const { config, refreshConfig, updateConfig } = useConfigStore();
  const { services, refreshServices, updateServices } = useServicesStore();
  const { items: lookbook, refreshLookbook, addItem: addLookbookItem, updateItem: updateLookbookItem, removeItem: removeLookbookItem } = useLookbookStore();
  
  // Initialize formData from config with defaults
  const [formData, setFormData] = useState({
    brand: config?.brand || '',
    tagline: config?.tagline || '',
    heroTitle: config?.heroTitle || '',
    heroSub: config?.heroSub || '',
    estYear: config?.estYear || '',
    statClients: config?.statClients || '',
    statExp: config?.statExp || '',
    statServices: config?.statServices || '',
    address: config?.address || '',
    contact: config?.contact || '',
    hours: config?.hours || '',
    ctaText: config?.ctaText || '',
    aboutText: config?.aboutText || '',
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLookbookModal, setShowLookbookModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingLookbook, setEditingLookbook] = useState<LookbookItem | null>(null);

  useEffect(() => {
    refreshConfig();
    refreshServices();
    refreshLookbook();
  }, [refreshConfig, refreshServices, refreshLookbook]);

  const handleSaveConfig = () => {
    updateConfig(formData);
    alert('Settings saved!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (editingLookbook) {
        updateLookbookItem({
          ...editingLookbook,
          image: event.target?.result as string,
        });
        setEditingLookbook({
          ...editingLookbook,
          image: event.target?.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
          <Palette className="w-8 h-8" />
          Customize
        </h1>
        <p className="text-[#7a6a50] text-sm">Brand, services, and explore page</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Brand Settings */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c9a84c]" />
                Brand Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7a6a50]">Brand Name</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Tagline</label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7a6a50]">Hero Title</label>
                  <Input
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Hero Subtitle</label>
                  <Input
                    value={formData.heroSub}
                    onChange={(e) => setFormData({ ...formData, heroSub: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7a6a50]">About Text</label>
                <Textarea
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats & Contact */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Stats & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-[#7a6a50]">Est. Year</label>
                  <Input
                    value={formData.estYear}
                    onChange={(e) => setFormData({ ...formData, estYear: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Clients Stat</label>
                  <Input
                    value={formData.statClients}
                    onChange={(e) => setFormData({ ...formData, statClients: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                    placeholder="500+"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Experience</label>
                  <Input
                    value={formData.statExp}
                    onChange={(e) => setFormData({ ...formData, statExp: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                    placeholder="7+ Years"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Services</label>
                  <Input
                    value={formData.statServices}
                    onChange={(e) => setFormData({ ...formData, statServices: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                    placeholder="50+"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7a6a50]">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">Contact</label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7a6a50]">Hours</label>
                  <Input
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7a6a50]">CTA Text</label>
                  <Input
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="btn-gold">
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Services & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((category) => (
                  <div key={category.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[#c9a84c] font-medium">{category.name}</h4>
                      <Badge className="badge-gold">{category.items.length} items</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {category.items.slice(0, 6).map((item) => (
                        <div key={item.id} className="text-sm p-2 rounded bg-[rgba(201,168,76,0.05)]">
                          <span className="text-[#f5f0e8]">{item.name}</span>
                          <span className="text-[#7a6a50] ml-2">Rs.{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lookbook */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#f5f0e8]">Lookbook</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingLookbook(null);
                    setShowLookbookModal(true);
                  }}
                  className="btn-gold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lookbook.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-3 cursor-pointer"
                    onClick={() => {
                      setEditingLookbook(item);
                      setShowLookbookModal(true);
                    }}
                  >
                    {item.image ? (
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-[rgba(201,168,76,0.1)]">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center mb-2">
                        <span className="text-4xl">{item.emoji}</span>
                      </div>
                    )}
                    <p className="text-[#f5f0e8] text-sm font-medium">{item.title}</p>
                    <p className="text-[#7a6a50] text-xs">{item.service}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Lookbook Edit Modal */}
      <Dialog open={showLookbookModal} onOpenChange={setShowLookbookModal}>
        <DialogContent className="max-w-md bg-[#0d0b07] border-[rgba(201,168,76,0.2)]">
          <DialogHeader>
            <DialogTitle className="gold-text">
              {editingLookbook ? 'Edit Lookbook' : 'Add Lookbook Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {editingLookbook && (
              <div>
                <label className="text-xs text-[#7a6a50] mb-2 block">Image</label>
                {editingLookbook.image ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img src={editingLookbook.image} alt={editingLookbook.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center mb-2">
                    <span className="text-6xl">{editingLookbook.emoji}</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-transparent border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingLookbook) {
                    updateLookbookItem(editingLookbook);
                  } else {
                    addLookbookItem({
                      ...editingLookbook,
                      id: `lb${Date.now()}`,
                    } as LookbookItem);
                  }
                  setShowLookbookModal(false);
                }}
                className="btn-gold flex-1"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setShowLookbookModal(false);
                  setEditingLookbook(null);
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
