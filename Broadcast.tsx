'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useClientsStore } from '@/lib/store';
import { Client, RANK_CONFIGS, Rank } from '@/lib/types';
import { getMaintenanceStatus, generateWhatsAppLink, getCurrentMonthKey } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Users, Gift, Calendar, AlertTriangle, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Recipient {
  client: Client;
  personalizedMessage: string;
}

export function Broadcast() {
  const { clients, refreshClients } = useClientsStore();
  const [selectedRank, setSelectedRank] = useState<Rank | 'all'>('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);

  useEffect(() => {
    refreshClients();
  }, []);

  const templates = [
    {
      id: 'maintenance',
      label: 'Maintenance Reminder',
      message: 'Hi {name}! You\'re Rs.{amount_needed} away from keeping your {rank} perks this month. Book now! 💛',
    },
    {
      id: 'rank_warning',
      label: 'Rank Drop Warning',
      message: 'Hi {name}, your {rank} rank is at risk. Spend Rs.{amount_needed} before month end to stay sparkly ✨',
    },
    {
      id: 'birthday',
      label: 'Birthday Greeting',
      message: 'Happy Birthday {name}! 🎂 Your Diamond birthday bonus is active — enjoy 5% extra off this month!',
    },
    {
      id: 'upgrade',
      label: 'Rank Upgrade',
      message: 'Congratulations {name}! 🎉 You\'ve been upgraded to {rank}. Your new perks are live!',
    },
    {
      id: 'points',
      label: 'Points Reminder',
      message: 'Hi {name}, you have {points} loyalty points waiting! Book a visit to redeem them 💅',
    },
    {
      id: 'custom',
      label: 'Custom Message',
      message: '',
    },
  ];

  const getRank = (client: Client): Rank => {
    let rank: Rank = 'new';
    for (const config of RANK_CONFIGS) {
      if (client.lifetimeSpend >= config.lifetimeMin) {
        rank = config.rank;
      }
    }
    return rank;
  };

  const filterClients = useMemo(() => {
    let filtered = [...clients];

    // Filter by rank
    if (selectedRank !== 'all') {
      filtered = filtered.filter(c => getRank(c) === selectedRank);
    }

    // Filter by special conditions
    if (selectedFilters.includes('at_risk')) {
      filtered = filtered.filter(c => {
        const status = getMaintenanceStatus(c);
        return status.percent < 100;
      });
    }

    if (selectedFilters.includes('birthday_this_month')) {
      const currentMonth = new Date().getMonth();
      filtered = filtered.filter(c => {
        if (!c.birthday) return false;
        return new Date(c.birthday).getMonth() === currentMonth;
      });
    }

    if (selectedFilters.includes('referral_active')) {
      filtered = filtered.filter(c => c.referralDiscount && !c.referralGiven);
    }

    return filtered;
  }, [clients, selectedRank, selectedFilters]);

  const personalizeMessage = (client: Client, message: string): string => {
    const rank = getRank(client);
    const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
    const maintStatus = getMaintenanceStatus(client);
    const currentMonth = getCurrentMonthKey();

    return message
      .replace(/{name}/g, client.name)
      .replace(/{rank}/g, `${config.emoji} ${config.label}`)
      .replace(/{points}/g, client.loyaltyPoints.toString())
      .replace(/{amount_needed}/g, maintStatus.amountNeeded.toLocaleString())
      .replace(/{deadline}/g, `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} ${new Date().toLocaleDateString('en-PK', { month: 'long' })}`);
  };

  const generateRecipients = () => {
    const message = selectedTemplate === 'custom' ? customMessage : templates.find(t => t.id === selectedTemplate)?.message || '';
    
    if (!message.trim()) {
      alert('Please select a template or enter a custom message');
      return;
    }

    const newRecipients = filterClients.map(client => ({
      client,
      personalizedMessage: personalizeMessage(client, message),
    }));

    setRecipients(newRecipients);
    setShowPreview(true);
  };

  const sendMessage = async (index: number) => {
    const recipient = recipients[index];
    if (!recipient) return;

    setSendingIndex(index);
    
    // Open WhatsApp with pre-filled message
    window.open(generateWhatsAppLink(recipient.client.phone, recipient.personalizedMessage), '_blank');
    
    // Small delay before allowing next send
    setTimeout(() => {
      setSendingIndex(null);
    }, 500);
  };

  const sendAllMessages = async () => {
    for (let i = 0; i < recipients.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      sendMessage(i);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
          <MessageCircle className="w-8 h-8" />
          Broadcast
        </h1>
        <p className="text-[#7a6a50] text-sm">Send WhatsApp messages to clients</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Recipient Selection */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c9a84c]" />
                Select Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rank Selection */}
              <div>
                <label className="text-xs text-[#7a6a50] mb-2 block">By Rank</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedRank('all')}
                    className={selectedRank === 'all' ? 'btn-gold' : 'btn-gold-outline'}
                  >
                    All Clients
                  </Button>
                  {RANK_CONFIGS.map((config) => (
                    <Button
                      key={config.rank}
                      size="sm"
                      onClick={() => setSelectedRank(config.rank)}
                      className={selectedRank === config.rank ? 'btn-gold' : 'btn-gold-outline'}
                    >
                      {config.emoji} {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="text-xs text-[#7a6a50] mb-2 block">Special Filters</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => toggleFilter('at_risk')}
                    className={selectedFilters.includes('at_risk') ? 'btn-gold' : 'btn-gold-outline'}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    At-Risk
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toggleFilter('birthday_this_month')}
                    className={selectedFilters.includes('birthday_this_month') ? 'btn-gold' : 'btn-gold-outline'}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Birthday This Month
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toggleFilter('referral_active')}
                    className={selectedFilters.includes('referral_active') ? 'btn-gold' : 'btn-gold-outline'}
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Referral Active
                  </Button>
                </div>
              </div>

              {/* Count */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(201,168,76,0.1)]">
                <span className="text-[#f5f0e8]">Selected Clients</span>
                <Badge className="badge-gold">{filterClients.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Message Composer */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="text-xs text-[#7a6a50] mb-2 block">Choose Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    if (e.target.value !== 'custom') {
                      const template = templates.find(t => t.id === e.target.value);
                      if (template) setCustomMessage(template.message);
                    }
                  }}
                  className="w-full bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] rounded-md px-3 py-2 text-[#f5f0e8]"
                >
                  <option value="">Select a template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Message Editor */}
              <div>
                <label className="text-xs text-[#7a6a50] mb-2 block">Message</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="min-h-32 bg-[rgba(201,168,76,0.05)] border-[rgba(201,168,76,0.2)] text-[#f5f0e8]"
                />
              </div>

              {/* Placeholders Help */}
              <div className="text-xs text-[#7a6a50] space-y-1">
                <p>Available placeholders:</p>
                <p className="flex flex-wrap gap-2">
                  <code className="px-2 py-1 rounded bg-[rgba(201,168,76,0.1)]">{'{name}'}</code>
                  <code className="px-2 py-1 rounded bg-[rgba(201,168,76,0.1)]">{'{rank}'}</code>
                  <code className="px-2 py-1 rounded bg-[rgba(201,168,76,0.1)]">{'{points}'}</code>
                  <code className="px-2 py-1 rounded bg-[rgba(201,168,76,0.1)]">{'{amount_needed}'}</code>
                  <code className="px-2 py-1 rounded bg-[rgba(201,168,76,0.1)]">{'{deadline}'}</code>
                </p>
              </div>

              <Button
                onClick={generateRecipients}
                disabled={filterClients.length === 0 || !customMessage.trim()}
                className="w-full btn-gold"
              >
                Preview Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif gold-text">Preview Messages</h2>
              <Button
                onClick={() => setShowPreview(false)}
                variant="ghost"
                className="text-[#7a6a50]"
              >
                ✕
              </Button>
            </div>

            <p className="text-[#7a6a50] text-sm mb-4">
              {recipients.length} messages ready to send
            </p>

            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {recipients.map((recipient, idx) => (
                  <div key={recipient.client.phone} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[#f5f0e8] font-medium">{recipient.client.name}</p>
                        <p className="text-xs text-[#7a6a50]">+92 {recipient.client.phone}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendMessage(idx)}
                        disabled={sendingIndex !== null}
                        className="btn-gold"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send
                      </Button>
                    </div>
                    <p className="text-sm text-[#f5f0e8] whitespace-pre-wrap bg-[rgba(201,168,76,0.05)] p-2 rounded">
                      {recipient.personalizedMessage}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Button onClick={sendAllMessages} className="btn-gold flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send All ({recipients.length})
              </Button>
              <Button onClick={() => setShowPreview(false)} variant="outline" className="btn-gold-outline">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
