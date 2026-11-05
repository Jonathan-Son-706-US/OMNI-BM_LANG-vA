import React from 'react';
import { Binary, Cpu, Terminal, CheckCircle2 } from 'lucide-react';

export default function OutputPanel({
  activeTab,
  onTabChange,
  tacOutput = '',
  tacError = '',
  asmOutput = '',
  asmError = '',
  consoleOutput = '',
  consoleError = '',
}) {
  return (
    <div className="output-section">
      {/* Marca de agua de fondo con 15% de opacidad y sin resplandor centrada en las pestañas */}
      <div className="output-watermark" aria-hidden="true">
        <img src="/logo1.avif" alt="Logo de fondo" />
      </div>

      {/* Cabecera con pestañas */}
      <div className="panel-header" style={{ position: 'relative', zIndex: 2 }}>
        <div className="tab-list">
          <button
            className={`tab-btn ${activeTab === 'tac' ? 'active' : ''}`}
            onClick={() => onTabChange('tac')}
          >
            <Binary size={13} />
            <span>Código Intermedio (TAC)</span>
            {tacOutput && <span style={{ fontSize: '9px', background: 'var(--green-subtle)', color: 'var(--green-primary)', padding: '1px 5px', borderRadius: 8 }}>Generado</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'asm' ? 'active' : ''}`}
            onClick={() => onTabChange('asm')}
          >
            <Cpu size={13} />
            <span>Assembler NASM</span>
            {asmOutput && <span style={{ fontSize: '9px', background: 'var(--green-subtle)', color: 'var(--green-primary)', padding: '1px 5px', borderRadius: 8 }}>Generado</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => onTabChange('console')}
          >
            <Terminal size={13} />
            <span>Consola / Ejecución</span>
            {consoleOutput && <span style={{ fontSize: '9px', background: 'var(--green-subtle)', color: 'var(--green-primary)', padding: '1px 5px', borderRadius: 8 }}>Compilado</span>}
          </button>
        </div>
      </div>

      {/* Contenido de cada pestaña con fondo transparente para dejar ver el logo de fondo */}
      <div className="output-content">
        {/* Pestaña: Código Intermedio (TAC) */}
        {activeTab === 'tac' && (
          (tacOutput || tacError) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tacError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '12px',
                  lineHeight: '18px',
                  whiteSpace: 'pre-wrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{tacError}</span>
                </div>
              )}
              {tacOutput && (
                <pre className="code-output-block tac-output-code">{tacOutput}</pre>
              )}
            </div>
          ) : (
            <div className="output-placeholder">
              <div className="output-placeholder-icon">
                <Binary size={24} />
              </div>
              <div style={{ maxWidth: '380px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '8px' }}>
                  Código Intermedio (TAC)
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                  Presiona el boton generar TAC
                </p>
              </div>
            </div>
          )
        )}

        {/* Pestaña: Assembler NASM */}
        {activeTab === 'asm' && (
          (asmOutput || asmError) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {asmError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '12px',
                  lineHeight: '18px',
                  whiteSpace: 'pre-wrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{asmError}</span>
                </div>
              )}
              {asmOutput && (
                <pre className="code-output-block">{asmOutput}</pre>
              )}
            </div>
          ) : (
            <div className="output-placeholder">
              <div className="output-placeholder-icon">
                <Cpu size={24} />
              </div>
              <div style={{ maxWidth: '380px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '8px' }}>
                  Assembler NASM (salida.asm)
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                  Presiona el boton generar NASM
                </p>
              </div>
            </div>
          )
        )}

        {/* Pestaña: Consola / Ejecución */}
        {activeTab === 'console' && (
          (consoleOutput || consoleError) ? (
            <div className="console-wrapper">
              {consoleError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '12px',
                  lineHeight: '18px',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>{consoleError}</span>
                </div>
              )}
              {consoleOutput && (
                <pre
                  className="console-line"
                  style={{
                    color: '#34d399',
                    fontSize: '14px',
                    lineHeight: '23px',
                    letterSpacing: '0.2px',
                  }}
                >
                  {consoleOutput}
                </pre>
              )}
            </div>
          ) : (
            <div className="output-placeholder">
              <div className="output-placeholder-icon">
                <Terminal size={24} />
              </div>
              <div style={{ maxWidth: '380px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '8px' }}>
                  Consola de Ensamblado y Ejecución
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                  Presiona el boton Ensamblar
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
