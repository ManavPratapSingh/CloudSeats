const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/items/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function fetchItems(status = '', category = '') {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (category && category !== 'ALL') params.append('category', category);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/items${query}`);
  if (!res.ok) throw new Error('Failed to load items');
  return res.json();
}

export async function createItem(payload) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Creation failed' }));
    throw new Error(err.detail || 'Failed to create item');
  }
  return res.json();
}

export async function updateItem(id, payload) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Update failed' }));
    throw new Error(err.detail || 'Failed to update item');
  }
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'Deletion failed' }));
    throw new Error(err.detail || 'Failed to delete item');
  }
}

export async function issueSeats(id, quantity) {
  const res = await fetch(`${API_BASE}/items/${id}/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: Number(quantity) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Allocation failed' }));
    throw new Error(err.detail || 'Failed to allocate seats');
  }
  return res.json();
}

