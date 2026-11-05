import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, CornerDownLeft } from 'lucide-react';

export default function StdinPromptModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = '',
  readCount = 1,
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSubmit(value);
  };

  const handleRunEmpty = () => {
    onSubmit('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 580, maxWidth: '94vw' }}>
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div className="modal-title" style={{ fontSize: '17px', gap: '10px' }}>
            <Terminal size={22} color="var(--green-primary)" />
            <span>Entrada para sentencias READ</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px', gap: '16px' }}>
            <p style={{ fontSize: '15px', color: '#e5e7eb', lineHeight: '24px', margin: 0 }}>
              Tu programa contiene{' '}
              <strong style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                {readCount} {readCount === 1 ? 'instrucción READ' : 'instrucciones READ'}
              </strong>
              . Ingresa los valores que consumirá el programa:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Valores de entrada (stdin) separados por espacio o enter:
              </label>
              <input
                ref={inputRef}
                type="text"
                className="console-stdin-input"
                style={{
                  fontSize: '16px',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--green-primary)',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Ejemplo: ${readCount === 1 ? '42' : '15 25'}`}
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '18px' }}>
                Cada número será asignado secuencialmente en orden a cada variable <code>READ</code>.
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
              style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '7px 12px' }}
              onClick={handleRunEmpty}
              title="Ejecutar sin enviar datos (recibirá EOF / 0)"
            >
              Ejecutar vacío (sin datos)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                style={{ fontSize: '13px', padding: '7px 16px' }}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '8px 20px', gap: '8px' }}
              >
                <Play size={14} />
                <span style={{ fontWeight: 600 }}>Ejecutar</span>
                <CornerDownLeft size={13} style={{ opacity: 0.75, marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
