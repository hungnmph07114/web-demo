import React from 'react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const icon = t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️';
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{icon}</span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
