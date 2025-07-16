// src/components/Dashboard/StatsCard.js
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  trendDirection = 'up',
  color = 'primary',
  className = '' 
}) {
  const colorClasses = {
    primary: 'border-primary-100 bg-primary-50',
    blue: 'border-blue-100 bg-blue-50',
    success: 'border-success-100 bg-success-50',
    warning: 'border-warning-100 bg-warning-50',
    danger: 'border-danger-100 bg-danger-50',
    gray: 'border-gray-100 bg-gray-50',
  };

  const trendColor = trendDirection === 'up' ? 'text-success-600' : 'text-danger-600';
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              {trendValue && (
                <div className={`flex items-center ${trendColor} mr-2`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium">{trendValue}</span>
                </div>
              )}
              <span className="text-gray-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;