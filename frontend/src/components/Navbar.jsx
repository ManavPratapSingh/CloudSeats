import React from 'react';

export default function Navbar({ onOpenCreate, onRefresh, loading }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">CloudSeats</span>
          <span className="brand-tag">SaaS License & Seat Manager</span>
        </div>
      </div>

      <div className="navbar-actions">
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Data"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin' : ''}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          Sync
        </button>

        <button className="btn btn-primary" onClick={onOpenCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Provision SaaS License
        </button>
      </div>
    </header>
  );
}

