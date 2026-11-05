import React from 'react';
import { Users, X } from 'lucide-react';

export default function MembersModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const integrantes = [
    { nombre: 'Abner Esaú Ambrocio Lima', carne: '202408028' },
    { nombre: 'Diego Jonathan Utuc Son', carne: '202408047' },
    { nombre: 'Jair Michael Otoniel Castillo Valdez', carne: '202408014' },
    { nombre: 'Diego Javier Jiménez Pineda', carne: '202408026' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <img
              src="/logo1.avif"
              alt="Logo"
              style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border-subtle)' }}
            />
            <span>Integrantes del Proyecto</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Proyecto Compiladores <strong>OMNI-BM_LANG</strong> - Compiladores I
          </p>

          {integrantes.map((m, idx) => (
            <div key={idx} className="member-row">
              <span className="member-name">{m.nombre}</span>
              <span className="member-id">{m.carne}</span>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
