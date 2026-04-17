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
    <Card className="glass border-white/5 overflow-hidden group">
      <CardContent className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
             </div>
             <span className="label-technical !text-white text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
             <Zap size={10} className="text-primary" />
             <span className="text-[8px] font-bold uppercase tracking-widest">Real-time</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">{period}</p>
            <div className="text-4xl font-semibold text-white tracking-tighter tabular-nums">{value}</div>
          </div>

          <div className="w-32 h-16 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5C07B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E5C07B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E5C07B"
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
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
