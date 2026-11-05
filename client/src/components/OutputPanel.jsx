import React from 'react';
import { Binary, Cpu, Terminal, CheckCircle2 } from 'lucide-react';

export default function OutputPanel({
  activeTab,
  onTabChange,
  tacOutput = '',
  asmOutput = '',
  consoleOutput = '',
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
          </button>
          <button
            className={`tab-btn ${activeTab === 'asm' ? 'active' : ''}`}
            onClick={() => onTabChange('asm')}
          >
            <Cpu size={13} />
            <span>Assembler NASM</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => onTabChange('console')}
          >
            <Terminal size={13} />
            <span>Consola / Ejecución</span>
          </button>
        </div>
      </div>

      {/* Contenido de cada pestaña con fondo transparente para dejar ver el logo de fondo */}
      <div className="output-content">
        {/* Pestaña: Código Intermedio (TAC) */}
        {activeTab === 'tac' && (
          tacOutput ? (
            <pre className="code-output-block">{tacOutput}</pre>
          ) : (
            <div className="output-placeholder">
              <div className="output-placeholder-icon">
                <Binary size={22} />
              </div>
              <div style={{ maxWidth: '380px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '6px' }}>
                  Código Intermedio (TAC)
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '18px' }}>
                  El código de tres direcciones generado por el compilador mediante tuberías (<code>stdout</code>) se mostrará aquí con temporales (<code>t1, t2</code>) y saltos condicionales.
                </p>
                <div
                  style={{
                    marginTop: '14px',
                    display: 'inline-block',
                    fontSize: '11px',
                    color: 'var(--green-primary)',
                    backgroundColor: 'var(--green-subtle)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Preparado para Inciso 2
                </div>
              </div>
            </div>
          )
        )}

        {/* Pestaña: Assembler NASM */}
        {activeTab === 'asm' && (
          asmOutput ? (
            <pre className="code-output-block">{asmOutput}</pre>
          ) : (
            <div className="output-placeholder">
              <div className="output-placeholder-icon">
                <Cpu size={22} />
              </div>
              <div style={{ maxWidth: '380px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '6px' }}>
                  Assembler NASM (x86 32-bit)
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '18px' }}>
                  El código generado en <code>salida.asm</code> (secciones <code>.bss</code>, <code>.text</code>, directivas globales y rutinas de E/S <code>input</code>/<code>output</code>) se visualizará aquí.
                </p>
                <div
                  style={{
                    marginTop: '14px',
                    display: 'inline-block',
                    fontSize: '11px',
                    color: 'var(--green-primary)',
                    backgroundColor: 'var(--green-subtle)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Preparado para Inciso 3
                </div>
              </div>
            </div>
          )
        )}

        {/* Pestaña: Consola / Ejecución */}
        {activeTab === 'console' && (
          consoleOutput ? (
            <div className="console-wrapper">
              <pre className="console-line">{consoleOutput}</pre>
            </div>
          ) : (
            <div className="console-wrapper">
              <div className="console-line text-muted">[OMNI-BM_LANG Terminal vA]</div>
              <div className="console-line text-muted">
                Entorno Linux x86 listo para ensamblado, enlace y ejecución interactiva.
              </div>
              <div className="console-line" style={{ marginTop: '8px', color: 'var(--green-primary)' }}>
                ➜ Los comandos de compilación (nasm, ld) y la ejecución interactiva del binario se mostrarán aquí.
              </div>
              <div
                style={{
                  marginTop: '16px',
                  alignSelf: 'flex-start',
                  fontSize: '11px',
                  color: 'var(--green-primary)',
                  backgroundColor: 'var(--green-subtle)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                Preparado para Incisos 4 y 5
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
