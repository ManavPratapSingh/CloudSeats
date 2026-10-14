import React, { useState } from 'react';

export default function CreateModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Engineering',
    quantity: 25,
    reorder_level: 5,
    location: 'Global',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'reorder_level' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Subscription name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('License SKU / Key is required');
      return;
    }
    if (formData.quantity < 0) {
      setError('Seats cannot be negative');
      return;
    }
    if (formData.reorder_level < 0) {
      setError('Reorder level cannot be negative');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Provision SaaS Subscription</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>SaaS Subscription / Tool Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. GitHub Enterprise, Slack Business, Figma Org"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>License SKU / Key *</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g. LIC-GH-001"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Engineering">Engineering</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Security">Security</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Initial Seats / Quota *</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Low Buffer Warning Level *</label>
                <input
                  type="number"
                  name="reorder_level"
                  min="0"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department / Region</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Global, US-East, Platform Team"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Provisioning...' : 'Provision Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

