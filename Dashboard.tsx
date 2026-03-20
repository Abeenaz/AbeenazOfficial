'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useClientsStore, useInventoryStore, useStaffStore } from '@/lib/store';
import { getDB, getCurrentMonthKey, getMonthlyRevenue, getTotalRevenue } from '@/lib/db-storage';
import { RANK_CONFIGS, Rank } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, IndianRupee, TrendingUp, AlertTriangle, 
  Gift, Package, Calendar, Sparkles 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { clients, refreshClients } = useClientsStore();
  const { inventory, refreshInventory } = useInventoryStore();
  const { staff, refreshStaff } = useStaffStore();
  
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    totalClients: 0,
    clientsByRank: {} as Record<Rank, number>,
    atRiskCount: 0,
    referralDiscounts: 0,
    lowStockCount: 0,
    recentVisits: [] as Array<{ client: string; service: string; amount: number; time: string }>,
    upcomingBirthdays: [] as Array<{ name: string; birthday: string }>,
  });

  useEffect(() => {
    refreshClients();
    refreshInventory();
    refreshStaff();
  }, []);

  useEffect(() => {
    if (clients.length === 0) return;
    
    const db = getDB();
    const currentMonth = getCurrentMonthKey();
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate stats
    let monthRevenue = 0;
    let todayRevenue = 0;
    const clientsByRank: Record<Rank, number> = {
      new: 0, bronze: 0, silver: 0, gold: 0, diamond: 0
    };
    let atRiskCount = 0;
    let referralDiscounts = 0;
    const recentVisits: Array<{ client: string; service: string; amount: number; time: string }> = [];
    const upcomingBirthdays: Array<{ name: string; birthday: string }> = [];
    
    const currentMonthNum = new Date().getMonth();
    
    clients.forEach(client => {
      // Monthly spend
      monthRevenue += client.monthlySpend[currentMonth] || 0;
      
      // Calculate rank
      let rank: Rank = 'new';
      for (const config of RANK_CONFIGS) {
        if (client.lifetimeSpend >= config.lifetimeMin) {
          rank = config.rank;
        }
      }
      clientsByRank[rank]++;
      
      // At-risk check
      const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
      const spent = client.monthlySpend[currentMonth] || 0;
      const maintPercent = config.monthlyMin > 0 ? (spent / config.monthlyMin) * 100 : 100;
      if (maintPercent < 100 && config.monthlyMin > 0) {
        atRiskCount++;
      }
      
      // Referral discounts
      if (client.referralDiscount && !client.referralGiven) {
        referralDiscounts++;
      }
      
      // Recent visits
      client.visitLog?.slice(0, 2).forEach(visit => {
        recentVisits.push({
          client: client.name,
          service: visit.services[0]?.name || 'Service',
          amount: visit.charged,
          time: visit.date,
        });
        
        // Today's revenue
        if (visit.date.split('T')[0] === today) {
          todayRevenue += visit.charged;
        }
      });
      
      // Upcoming birthdays
      if (client.birthday) {
        const birthMonth = new Date(client.birthday).getMonth();
        if (birthMonth === currentMonthNum) {
          upcomingBirthdays.push({
            name: client.name,
            birthday: client.birthday,
          });
        }
      }
    });
    
    // Add revenue from DB
    monthRevenue = getMonthlyRevenue(currentMonth);
    
    setStats({
      todayRevenue,
      monthRevenue,
      totalRevenue: getTotalRevenue(),
      totalClients: clients.length,
      clientsByRank,
      atRiskCount,
      referralDiscounts,
      lowStockCount: inventory.filter(i => i.qty <= i.lowAt).length,
      recentVisits: recentVisits.slice(0, 5),
      upcomingBirthdays: upcomingBirthdays.slice(0, 5),
    });
  }, [clients, inventory]);

  const statCards = [
    {
      title: "Today's Revenue",
      value: `Rs.${stats.todayRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: '#4ade80',
    },
    {
      title: "This Month",
      value: `Rs.${stats.monthRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: '#c9a84c',
    },
    {
      title: "All-Time Revenue",
      value: `Rs.${stats.totalRevenue.toLocaleString()}`,
      icon: Sparkles,
      color: '#b9f2ff',
    },
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      icon: Users,
      color: '#e8a4b8',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif gold-text">Dashboard</h1>
            <p className="text-[#7a6a50] text-sm">Welcome back, Admin</p>
          </div>
          <div className="text-right">
            <p className="text-[#7a6a50] text-xs">
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((stat, idx) => (
            <motion.div key={idx} variants={item}>
              <Card className="glass-card border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-[#f5f0e8]">{stat.value}</p>
                  <p className="text-xs text-[#7a6a50]">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Clients by Rank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-[rgba(201,168,76,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#f5f0e8]">Clients by Rank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RANK_CONFIGS.slice().reverse().map((config) => (
                  <div key={config.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.emoji}</span>
                      <span className="text-[#f5f0e8]">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[rgba(201,168,76,0.1)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c9a84c] to-[#8b6914] rounded-full transition-all duration-500"
                          style={{ width: `${stats.totalClients > 0 ? (stats.clientsByRank[config.rank] / stats.totalClients) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#7a6a50] w-6 text-right">
                        {stats.clientsByRank[config.rank] || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-[rgba(201,168,76,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#f5f0e8]">Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.3)] cursor-pointer hover:bg-[rgba(249,115,22,0.15)] transition-colors"
                  onClick={() => onNavigate('alerts')}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#f97316]" />
                    <span className="text-[#f5f0e8]">At-Risk Clients</span>
                  </div>
                  <Badge className="badge-orange">{stats.atRiskCount}</Badge>
                </div>

                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] cursor-pointer hover:bg-[rgba(201,168,76,0.15)] transition-colors"
                  onClick={() => onNavigate('clients')}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-[#c9a84c]" />
                    <span className="text-[#f5f0e8]">Referral Discounts Active</span>
                  </div>
                  <Badge className="badge-gold">{stats.referralDiscounts}</Badge>
                </div>

                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] cursor-pointer hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                  onClick={() => onNavigate('inventory')}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#ef4444]" />
                    <span className="text-[#f5f0e8]">Low Stock Items</span>
                  </div>
                  <Badge className="badge-red">{stats.lowStockCount}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-[rgba(201,168,76,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#f5f0e8]">Recent Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentVisits.length === 0 ? (
                  <p className="text-[#7a6a50] text-sm text-center py-4">No recent visits</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentVisits.map((visit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(201,168,76,0.05)] transition-colors">
                        <div>
                          <p className="text-[#f5f0e8] font-medium">{visit.client}</p>
                          <p className="text-[#7a6a50] text-xs">{visit.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#c9a84c]">Rs.{visit.amount.toLocaleString()}</p>
                          <p className="text-[#7a6a50] text-xs">
                            {new Date(visit.time).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Birthdays */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border-[rgba(201,168,76,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#f5f0e8] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#e8a4b8]" />
                  Birthdays This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.upcomingBirthdays.length === 0 ? (
                  <p className="text-[#7a6a50] text-sm text-center py-4">No birthdays this month</p>
                ) : (
                  <div className="space-y-3">
                    {stats.upcomingBirthdays.map((bday, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(201,168,76,0.05)] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎂</span>
                          <span className="text-[#f5f0e8]">{bday.name}</span>
                        </div>
                        <span className="text-[#7a6a50] text-sm">
                          {new Date(bday.birthday).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ScrollArea>
  );
}
