'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useClientsStore } from '@/lib/store';
import { Client, RANK_CONFIGS, Rank } from '@/lib/types';
import { getMaintenanceStatus, generateWhatsAppLink, getCurrentMonthKey } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, MessageCircle, Info, Clock } from 'lucide-react';

interface AtRiskClient {
  client: Client;
  rank: Rank;
  maintStatus: {
    percent: number;
    amountNeeded: number;
    color: string;
    status: string;
  };
  alertType: 'early' | 'grace' | 'demoted';
}

export function AlertsPanel() {
  const { clients, refreshClients } = useClientsStore();

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  // Calculate at-risk clients using useMemo
  const atRiskClients = useMemo(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    const riskClients: AtRiskClient[] = [];

    clients.forEach(client => {
      // Get rank
      let rank: Rank = 'new';
      for (const config of RANK_CONFIGS) {
        if (client.lifetimeSpend >= config.lifetimeMin) {
          rank = config.rank;
        }
      }

      const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
      
      // Skip if no monthly requirement
      if (config.monthlyMin === 0) return;
      
      // Skip if rank locked
      if (client.rankLocked) return;

      const maintStatus = getMaintenanceStatus(client);

      // Check if at risk
      if (maintStatus.percent < 100 || client.demoted) {
        let alertType: 'early' | 'grace' | 'demoted' = 'early';
        
        if (client.demoted) {
          alertType = 'demoted';
        } else if (dayOfMonth >= 25) {
          alertType = 'grace';
        } else if (dayOfMonth >= 15) {
          alertType = 'early';
        } else {
          return; // Not alert worthy yet
        }

        riskClients.push({
          client,
          rank,
          maintStatus,
          alertType,
        });
      }
    });

    // Sort by severity
    riskClients.sort((a, b) => {
      if (a.alertType === 'demoted' && b.alertType !== 'demoted') return -1;
      if (b.alertType === 'demoted' && a.alertType !== 'demoted') return 1;
      return a.maintStatus.percent - b.maintStatus.percent;
    });

    return riskClients;
  }, [clients]);

  const getRank = (client: Client): Rank => {
    let rank: Rank = 'new';
    for (const config of RANK_CONFIGS) {
      if (client.lifetimeSpend >= config.lifetimeMin) {
        rank = config.rank;
      }
    }
    return rank;
  };

  const getAlertMessage = (item: AtRiskClient): string => {
    const config = RANK_CONFIGS.find(r => r.rank === item.rank) || RANK_CONFIGS[0];
    const name = item.client.name;
    
    if (item.alertType === 'demoted') {
      return `Hi ${name}, your rank was recently changed. Visit us to restore your ${config.label} perks! 💛`;
    }
    if (item.alertType === 'grace') {
      return `Hi ${name}! ⚠️ Your ${config.label} rank is at risk. Spend Rs.${item.maintStatus.amountNeeded.toLocaleString()} before month end to keep your perks! ✨`;
    }
    return `Hi ${name}! You're Rs.${item.maintStatus.amountNeeded.toLocaleString()} away from your ${config.label} monthly goal. Book your appointment! 💛`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          Alerts
        </h1>
        <p className="text-[#7a6a50] text-sm">
          {atRiskClients.length} clients need attention
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Rules Reference */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8] flex items-center gap-2">
                <Info className="w-5 h-5 text-[#c9a84c]" />
                Rank Maintenance Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                  <Clock className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#f5f0e8] font-medium">Day 15+ Warning</p>
                    <p className="text-[#7a6a50]">Early warning when maintenance is below 100%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                  <Clock className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#f5f0e8] font-medium">Day 25+ Grace Period</p>
                    <p className="text-[#7a6a50]">Critical alert - send WhatsApp reminder</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                  <AlertTriangle className="w-5 h-5 text-[#f472b6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#f5f0e8] font-medium">2 Missed Months</p>
                    <p className="text-[#7a6a50]">Rank drops one tier. 2-month restoration window.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Requirements */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">Monthly Minimums by Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {RANK_CONFIGS.filter(r => r.rank !== 'new').map(config => (
                  <div key={config.rank} className="text-center p-3 rounded-lg bg-[rgba(201,168,76,0.05)]">
                    <span className="text-2xl">{config.emoji}</span>
                    <p className="text-[#f5f0e8] font-medium mt-1">{config.label}</p>
                    <p className="text-[#c9a84c] text-sm">Rs.{config.monthlyMin.toLocaleString()}/mo</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At-Risk Clients List */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#f5f0e8]">At-Risk Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {atRiskClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#4ade80]">All clients are on track! 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskClients.map((item, idx) => {
                    const config = RANK_CONFIGS.find(r => r.rank === item.rank) || RANK_CONFIGS[0];
                    
                    return (
                      <motion.div
                        key={item.client.phone}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass-card p-4 ${
                          item.alertType === 'demoted' 
                            ? 'border-[rgba(244,114,182,0.4)]' 
                            : item.alertType === 'grace'
                            ? 'border-[rgba(239,68,68,0.4)]'
                            : 'border-[rgba(249,115,22,0.4)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.alertType === 'demoted'
                                ? 'bg-[rgba(244,114,182,0.2)]'
                                : item.alertType === 'grace'
                                ? 'bg-[rgba(239,68,68,0.2)]'
                                : 'bg-[rgba(249,115,22,0.2)]'
                            }`}>
                              <AlertTriangle className={`w-5 h-5 ${
                                item.alertType === 'demoted'
                                  ? 'text-[#f472b6]'
                                  : item.alertType === 'grace'
                                  ? 'text-[#ef4444]'
                                  : 'text-[#f97316]'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[#f5f0e8] font-medium">{item.client.name}</p>
                                <Badge className="badge-gold text-xs">
                                  {config.emoji} {config.label}
                                </Badge>
                                {item.alertType === 'demoted' && (
                                  <Badge className="badge-rose text-xs">Demoted</Badge>
                                )}
                              </div>
                              <p className="text-[#7a6a50] text-sm">
                                Rs.{item.maintStatus.amountNeeded.toLocaleString()} needed • {Math.round(item.maintStatus.percent)}% maintenance
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => window.open(
                              generateWhatsAppLink(item.client.phone, getAlertMessage(item)),
                              '_blank'
                            )}
                            className="btn-gold"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Alert
                          </Button>
                        </div>

                        {/* Maintenance Progress Bar */}
                        <div className="mt-3">
                          <div className="h-2 bg-[rgba(201,168,76,0.1)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.maintStatus.percent}%`,
                                backgroundColor: item.maintStatus.color,
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
