import React, { useState } from 'react';

export default function IssueModal({ isOpen, item, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Please enter a quantity greater than zero');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(item.id, quantity);
      onClose();
    } catch (err) {
      // Handles 409 Conflict message from backend
      setError(err.message || 'Failed to allocate seats');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Allocate SaaS Seats</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="allocation-summary">
              <span className="summary-title">{item.name}</span>
              <div className="summary-details">
                <span>SKU: <code>{item.sku}</code></span>
                <span>Available: <strong>{item.quantity} seats</strong></span>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>Number of Seats to Allocate *</label>
              <input
                type="number"
                min="1"
                max={item.quantity + 20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                autoFocus
              />
              <span className="form-hint">
                Stock/Seat allocation will decrease available seats and record Prometheus metrics.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

