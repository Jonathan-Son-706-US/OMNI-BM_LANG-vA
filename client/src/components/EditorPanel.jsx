import React, { useRef, useEffect } from 'react';
import { FileCode2 } from 'lucide-react';

export default function EditorPanel({
  filename,
  code,
  onChange,
  onSave,
  isModified,
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Conteo de lineas
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Sincronizar scroll entre numeros de linea y editor
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Manejo de atajos y sangria automatica
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insertar 4 espacios
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);

      // Reposicionar cursor
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }

    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const match = currentLine.match(/^\s+/);
      const indent = match ? match[0] : '';

      // Sangria adicional tras abrir llave
      const extraIndent = currentLine.trim().endsWith('{') ? '    ' : '';

      if (indent || extraIndent) {
        e.preventDefault();
        const insertion = '\n' + indent + extraIndent;
        const newCode = code.substring(0, start) + insertion + code.substring(textarea.selectionEnd);
        onChange(newCode);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
        });
      }
    }
  };

  return (
    <div className="editor-section">
      {/* Logo de fondo */}
      <div className="editor-watermark" aria-hidden="true">
        <img src="/logo1.avif" alt="Fondo Editor" />
      </div>

      {/* Encabezado del editor */}
      <div className="panel-header" style={{ position: 'relative', zIndex: 2 }}>
        <div className="panel-title">
          <FileCode2 size={14} color="var(--green-primary)" />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>{filename || 'sin_titulo.bml'}</span>
          <span
            className={`file-status-indicator ${isModified ? 'modified' : ''}`}
            title={isModified ? 'Cambios sin guardar' : 'Guardado'}
          />
          {isModified && (
            <span style={{ fontSize: '10px', color: '#f59e0b' }}>(modificado)</span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {lineCount} {lineCount === 1 ? 'línea' : 'líneas'} | {code.length} caracteres
        </div>
      </div>

      {/* Area de edicion */}
      <div className="editor-wrapper">
        <div className="line-numbers" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="Escribe el codigo en lenguaje BML..."
        />
      </div>
    </div>
  );
}
