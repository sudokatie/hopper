'use client';

import { useState } from 'react';
import { Replay, ReplayData } from '../game/Replay';

interface ReplayImportProps {
  onImport: (data: ReplayData) => void;
  onClose: () => void;
}

export function ReplayImport({ onImport, onClose }: ReplayImportProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    if (!code.trim()) {
      setError('Please paste a replay code');
      return;
    }

    const data = Replay.decode(code.trim());
    if (!data) {
      setError('Invalid replay code');
      return;
    }

    onImport(data);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a2e',
          border: '3px solid #3b82f6',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          color: '#e0e0e0',
        }}
      >
        <h2
          style={{
            color: '#3b82f6',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '24px',
          }}
        >
          WATCH REPLAY
        </h2>

        <p
          style={{
            textAlign: 'center',
            color: '#888',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          Paste a replay code to watch
        </p>

        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder="Paste replay code here..."
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: '#0d0d1a',
            border: error ? '2px solid #ef4444' : '2px solid #333',
            borderRadius: '4px',
            color: '#fff',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '12px',
            resize: 'none',
            marginBottom: '8px',
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <div
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleImport}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            WATCH
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid #888',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
