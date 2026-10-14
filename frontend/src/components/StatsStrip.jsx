import React from 'react';

export default function StatsStrip({ stats, activeStatus, onSelectStatus }) {
  const cards = [
    {
      key: 'ALL',
      title: 'Total Subscriptions',
      value: stats.total || 0,
      badge: 'All Assets',
      badgeClass: 'badge-neutral',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"/>
          <line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
      ),
    },
    {
      key: 'IN_STOCK',
      title: 'Available Quotas',
      value: stats.in_stock || 0,
      badge: 'Healthy Buffer',
      badgeClass: 'badge-success',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      key: 'LOW',
      title: 'Low Seat Warnings',
      value: stats.low || 0,
      badge: 'Action Needed',
      badgeClass: 'badge-warning',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      key: 'OUT_OF_STOCK',
      title: 'Depleted Seats',
      value: stats.out_of_stock || 0,
      badge: '0 Seats Left',
      badgeClass: 'badge-danger',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const isSelected = activeStatus === card.key;
        return (
          <div
            key={card.key}
            className={`stat-card ${isSelected ? 'stat-card-active' : ''}`}
            onClick={() => onSelectStatus(card.key)}
            role="button"
            tabIndex={0}
          >
            <div className="stat-card-header">
              <span className="stat-title">{card.title}</span>
              <div className="stat-icon">{card.icon}</div>
            </div>
            <div className="stat-card-body">
              <span className="stat-value">{card.value}</span>
              <span className={`badge ${card.badgeClass}`}>{card.badge}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

