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

  // Calcular número de líneas
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Sincronizar scroll vertical entre números de línea y textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Manejo de teclas especiales (Tab, Enter con auto-indentación, atajo Ctrl+S)
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

      // Reposicionar cursor tras el nuevo render
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

      // Si la línea actual termina con '{', agregar indent adicional
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
      {/* Marca de agua de fondo con transparencia reducida en el editor */}
      <div className="editor-watermark" aria-hidden="true">
        <img src="/logo1.avif" alt="Fondo Editor" />
      </div>

      {/* Cabecera del editor */}
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

      {/* Área del editor con números de línea */}
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
          placeholder="Escribe aquí tu código en lenguaje .bml (ej: MAIN { DEC $x; $x => 10; WRITE $x; })"
        />
      </div>
    </div>
  );
}
