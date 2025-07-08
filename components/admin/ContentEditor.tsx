'use client';

import React, { useState, useEffect } from 'react';

interface ContentItem {
  _id: string;
  key: string;
  value: string;
}

export default function ContentEditor() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleUpdate = async (item: ContentItem) => {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: item.key, value: item.value }),
    });
    const updated = await response.json();
    setItems((prev) => prev.map((i) => (i.key === updated.key ? updated : i)));
    alert(`Saved: ${updated.key}`);
  };

  const handleNew = async () => {
    if (!newKey) return;
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newKey, value: newValue }),
    });
    const created = await response.json();
    setItems((prev) => [...prev, created]);
    setNewKey('');
    setNewValue('');
    alert(`Added: ${created.key}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold theme-text-secondary">Content Editor</h2>
      {items.map((item) => (
        <div key={item._id} className="grid grid-cols-3 gap-4 items-center">
          <label className="col-span-1 text-sm font-medium theme-text-secondary">{item.key}</label>
          <input
            className="col-span-1 theme-input"
            value={item.value}
            onChange={(e) =>
              setItems((prev) =>
                prev.map((i) =>
                  i.key === item.key ? { ...i, value: e.target.value } : i
                )
              )
            }
          />
          <button
            className="col-span-1 theme-button-primary"
            data-style="rounded"
            onClick={() => handleUpdate(item)}
          >
            Save
          </button>
        </div>
      ))}

      <div className="pt-6 border-t theme-surface" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold theme-text-secondary mb-3">Add New Content</h3>
        <div className="grid grid-cols-3 gap-4 items-center">
          <input
            placeholder="Key"
            className="col-span-1 theme-input"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            placeholder="Value"
            className="col-span-1 theme-input"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            className="col-span-1 theme-button-secondary"
            data-style="rounded"
            onClick={handleNew}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
