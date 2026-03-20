'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDB, getTotalRevenue, getMonthlyRevenue } from '@/lib/db-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IndianRupee, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export function RevenueTracking() {
  // Calculate revenue data using useMemo (initial load only)
  const { revenueData, totalRevenue, thisMonthRevenue, maxRevenue } = useMemo(() => {
    const db = getDB();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const data = Object.entries(db.revenue)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month));
    
    const total = getTotalRevenue();
    const thisMonth = getMonthlyRevenue(currentMonth);
    const max = Math.max(...data.map(d => d.amount), 1);
    
    return { revenueData: data, totalRevenue: total, thisMonthRevenue: thisMonth, maxRevenue: max };
  }, []);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[rgba(201,168,76,0.1)]">
        <h1 className="text-2xl md:text-3xl font-serif gold-text flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          Revenue
        </h1>
        <p className="text-[#7a6a50] text-sm">Track your earnings over time</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-[rgba(201,168,76,0.2)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <IndianRupee className="w-5 h-5 text-[#4ade80]" />
                    <span className="text-xs text-[#7a6a50]">This Month</span>
                  </div>
                  <p className="text-2xl font-semibold text-[#f5f0e8]">
                    Rs.{thisMonthRevenue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-[rgba(201,168,76,0.2)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#c9a84c]" />
                    <span className="text-xs text-[#7a6a50]">All-Time</span>
                  </div>
                  <p className="text-2xl font-semibold text-[#c9a84c]">
                    Rs.{totalRevenue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-[rgba(201,168,76,0.2)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#e8a4b8]" />
                    <span className="text-xs text-[#7a6a50]">Months Tracked</span>
                  </div>
                  <p className="text-2xl font-semibold text-[#f5f0e8]">
                    {revenueData.length}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Breakdown */}
          <Card className="glass-card border-[rgba(201,168,76,0.2)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#f5f0e8]">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <p className="text-[#7a6a50] text-center py-8">No revenue data yet</p>
              ) : (
                <div className="space-y-4">
                  {revenueData.map((data, idx) => (
                    <motion.div
                      key={data.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#f5f0e8]">{formatMonth(data.month)}</span>
                        <span className="text-[#c9a84c] font-medium">
                          Rs.{data.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-[rgba(201,168,76,0.1)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.amount / maxRevenue) * 100}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#c9a84c] to-[#8b6914] rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
