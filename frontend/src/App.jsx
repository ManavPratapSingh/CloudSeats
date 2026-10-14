import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsStrip from './components/StatsStrip';
import ItemTable from './components/ItemTable';
import CreateModal from './components/CreateModal';
import IssueModal from './components/IssueModal';
import EditModal from './components/EditModal';
import { fetchStats, fetchItems, createItem, updateItem, deleteItem, issueSeats } from './api';

export default function App() {
  const [stats, setStats] = useState({ total: 0, in_stock: 0, low: 0, out_of_stock: 0 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerError, setBannerError] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [issueTarget, setIssueTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setBannerError('');
      const [statsData, itemsData] = await Promise.all([
        fetchStats(),
        fetchItems(activeStatus, selectedCategory),
      ]);
      setStats(statsData);
      setItems(itemsData);
    } catch (err) {
      setBannerError(err.message || 'Failed to sync with backend');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (payload) => {
    await createItem(payload);
    await loadData();
  };

  const handleIssue = async (id, quantity) => {
    await issueSeats(id, quantity);
    await loadData();
  };

  const handleUpdate = async (id, payload) => {
    await updateItem(id, payload);
    await loadData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke and delete ${name}?`)) {
      return;
    }
    try {
      await deleteItem(id);
      await loadData();
    } catch (err) {
      setBannerError(err.message || 'Failed to delete subscription');
    }
  };

  // Derive available categories dynamically
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ).sort();

  return (
    <div className="app-container">
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onRefresh={loadData}
        loading={loading}
      />

      {bannerError && (
        <div className="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{bannerError}</span>
        </div>
      )}

      <StatsStrip
        stats={stats}
        activeStatus={activeStatus}
        onSelectStatus={(st) => setActiveStatus(st)}
      />

      <ItemTable
        items={items}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        onOpenIssue={(item) => setIssueTarget(item)}
        onOpenEdit={(item) => setEditTarget(item)}
        onDelete={handleDelete}
      />

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <IssueModal
        isOpen={Boolean(issueTarget)}
        item={issueTarget}
        onClose={() => setIssueTarget(null)}
        onSubmit={handleIssue}
      />

      <EditModal
        isOpen={Boolean(editTarget)}
        item={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

