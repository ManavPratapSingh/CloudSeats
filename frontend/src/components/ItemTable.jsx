import React from 'react';

export default function ItemTable({
  items,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  activeStatus,
  onStatusChange,
  onOpenIssue,
  onOpenEdit,
  onDelete,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return <span className="badge badge-success">Available</span>;
      case 'LOW':
        return <span className="badge badge-warning">Low Buffer</span>;
      case 'OUT_OF_STOCK':
        return <span className="badge badge-danger">Depleted</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchesQuery;
  });

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search SaaS licenses, SKU, department..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="status-tabs">
          {['ALL', 'IN_STOCK', 'LOW', 'OUT_OF_STOCK'].map((st) => (
            <button
              key={st}
              className={`tab-btn ${activeStatus === st ? 'tab-btn-active' : ''}`}
              onClick={() => onStatusChange(st)}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SaaS Subscription</th>
              <th>License SKU</th>
              <th>Available Seats</th>
              <th>Reorder Level</th>
              <th>Department / Region</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  <div className="spinner"></div>
                  <p>Loading subscriptions...</p>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <p>No SaaS subscriptions found matching criteria.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-name-cell">
                      <span className="item-name">{item.name}</span>
                      <span className="item-category-tag">{item.category}</span>
                    </div>
                  </td>
                  <td>
                    <code className="sku-pill">{item.sku}</code>
                  </td>
                  <td>
                    <div className="seats-cell">
                      <span className="seats-number">{item.quantity}</span>
                      <span className="seats-label">seats</span>
                    </div>
                  </td>
                  <td>
                    <span className="reorder-tag">&le; {item.reorder_level} buffer</span>
                  </td>
                  <td>
                    <span className="location-text">{item.location}</span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-issue"
                        onClick={() => onOpenIssue(item)}
                        disabled={item.quantity === 0}
                        title="Allocate Seats"
                      >
                        Allocate Seats
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => onOpenEdit(item)}
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => onDelete(item.id, item.name)}
                        title="Revoke License"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

