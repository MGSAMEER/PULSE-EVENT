'use client';

import React from 'react';
import { Card, CardContent } from './card';
import { CircleDollarSign, TrendingUp, UserPlus, Zap } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface MetricProps {
  title: string;
  value: string | number;
  period?: string;
  data: any[];
  color?: string;
  icon: any;
}

const MetricCard: React.FC<MetricProps> = ({ title, value, period = 'Last 28 days', data, color = '#E5C07B', icon: Icon }) => {
  const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-muted)]">{title}</div>
            <div className="text-[9px] text-[var(--text-dim)] mt-0.5">{period}</div>
          </div>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 group-hover:text-[var(--primary)]">LIVE</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-4xl font-semibold tracking-[-2.2px] text-white tabular-nums">{value}</div>
        <div className="w-28 h-14 -mb-1 -mr-1 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#7C5CFF" fill={`url(#${gradientId})`} strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function AreaChart1({ analytics }: { analytics?: any }) {
  // Map real analytics data or use fallback dummy patterns
  const revenueValue = analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString()}` : '₹0';
  const usersValue = analytics?.totalUsers?.toLocaleString() || '0';
  const bookingsValue = analytics?.totalBookings?.toLocaleString() || '0';

  // Extract simple trend data from eventBookings if available
  const revenueTrend = analytics?.eventBookings?.map((e: any) => ({ value: e.revenue })) || [{value: 0}, {value: 100}, {value: 50}, {value: 300}];
  const userTrend = [{value: 10}, {value: 40}, {value: 20}, {value: 100}]; // Simplification
  const bookingTrend = analytics?.eventBookings?.map((e: any) => ({ value: e.bookingsCount })) || [{value: 1}, {value: 5}, {value: 3}, {value: 10}];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <MetricCard 
          title="Revenue" 
          value={revenueValue} 
          data={revenueTrend} 
          icon={CircleDollarSign} 
        />
        <MetricCard 
          title="Total Audience" 
          value={usersValue} 
          data={userTrend} 
          icon={UserPlus} 
          period="Total Registered"
        />
        <MetricCard 
          title="Confirmed Bookings" 
          value={bookingsValue} 
          data={bookingTrend} 
          icon={TrendingUp} 
          period="Across Sessions"
        />
      </div>
    </div>
  );
}
