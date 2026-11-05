import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, CornerDownLeft, AlertOctagon } from 'lucide-react';

export default function StdinPromptModal({
  isOpen,
  onClose,
  onSubmit,
  onCancelRun,
  varName = '$x',
  readIndex = 1,
  totalReads = 1,
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, varName, readIndex]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '94vw' }}>
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div className="modal-title" style={{ fontSize: '17px', gap: '10px' }}>
            <Terminal size={22} color="var(--green-primary)" />
            <span>
              Entrada requerida para <strong>READ {varName ? `(${varName})` : ''}</strong>
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px', gap: '16px' }}>
            <p style={{ fontSize: '15px', color: '#e5e7eb', lineHeight: '24px', margin: 0 }}>
              El programa se encuentra en <strong style={{ color: 'var(--green-primary)' }}>pausa</strong> esperando el valor para{' '}
              <strong style={{
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {varName || 'READ'}
              </strong>
              {totalReads > 1 && (
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                  (Lectura {readIndex} de {totalReads})
                </span>
              )}:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Ingresa un número entero y presiona Enter:
              </label>
              <input
                ref={inputRef}
                type="text"
                className="console-stdin-input"
                style={{
                  fontSize: '17px',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--green-primary)',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ejemplo: 42"
                autoComplete="off"
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '18px' }}>
                El valor se enviará al proceso nativo por <code>stdin</code> y la ejecución continuará.
              </span>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <button
              type="button"
              className="btn"
              style={{ fontSize: '13px', color: '#f87171', padding: '7px 12px', gap: '6px' }}
              onClick={onCancelRun || onClose}
              title="Cancelar la ejecución del programa"
            >
              <AlertOctagon size={14} />
              <span>Detener ejecución</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                style={{ fontSize: '13px', padding: '7px 16px' }}
                onClick={onClose}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '8px 20px', gap: '8px' }}
                disabled={!value.trim()}
              >
                <Play size={14} />
                <span style={{ fontWeight: 600 }}>Enviar valor</span>
                <CornerDownLeft size={13} style={{ opacity: 0.75, marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
