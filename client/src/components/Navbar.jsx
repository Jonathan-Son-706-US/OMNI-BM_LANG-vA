import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  ChevronDown,
  Binary,
  Cpu,
  Play,
  Users,
  Upload,
} from 'lucide-react';

export default function Navbar({
  currentFilename,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onDownloadFile,
  onUploadFile,
  filesList,
  isSaving,
  isModified,
  onOpenMembers,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadFile(file.name, event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="ide-navbar">
      {/* Marca / Título con logo oficial */}
      <div className="nav-brand">
        <img
          src="/logo1.avif"
          alt="OMNI-BM_LANG Logo"
          className="brand-logo-img"
        />
        <span className="brand-title">OMNI-BM_LANG</span>
        <span className="brand-badge">IDE vA</span>
      </div>

      {/* Acciones principales: Archivos (Inciso 1) */}
      <div className="nav-actions">
        <div className="btn-group">
          <button className="btn" onClick={onNewFile} title="Crear nuevo archivo .bml">
            <FilePlus size={14} />
            <span>Nuevo</span>
          </button>

          <div className="file-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Abrir archivo existente en el servidor"
            >
              <FolderOpen size={14} />
              <span>Abrir</span>
              <ChevronDown size={12} />
            </button>

            {dropdownOpen && (
              <div className="file-dropdown-menu">
                <div
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  Archivos en el proyecto:
                </div>
                {filesList.length === 0 ? (
                  <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    No hay archivos .bml disponibles
                  </div>
                ) : (
                  filesList.map((file) => (
                    <button
                      key={file.name}
                      className={`dropdown-item ${currentFilename === file.name ? 'active' : ''}`}
                      onClick={() => {
                        onOpenFile(file.name);
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{file.name}</span>
                      {file.isBml && (
                        <span style={{ fontSize: '10px', color: 'var(--green-primary)' }}>.bml</span>
                      )}
                    </button>
                  ))
                )}
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setDropdownOpen(false);
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={12} /> Cargar desde equipo...
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className={`btn ${isModified ? 'btn-primary' : ''}`}
            onClick={onSaveFile}
            disabled={isSaving}
            title="Guardar archivo (Ctrl+S)"
          >
            <Save size={14} />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>

          <button className="btn" onClick={onDownloadFile} title="Descargar archivo a tu equipo">
            <Download size={14} />
            <span>Descargar</span>
          </button>
        </div>

        {/* Input oculto para subir archivo desde el navegador */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".bml,.txt"
          onChange={handleFileUpload}
        />

        {/* Botones de los siguientes Incisos (preparados para activarse) */}
        <div className="btn-group" style={{ opacity: 0.65 }}>
          <button className="btn" disabled title="Inciso 2: Generar Código Intermedio (Próximo paso)">
            <Binary size={14} />
            <span>TAC</span>
          </button>
          <button className="btn" disabled title="Inciso 3: Generar Código Assembler NASM">
            <Cpu size={14} />
            <span>NASM</span>
          </button>
          <button className="btn" disabled title="Inciso 4: Ensamblar Ejecutable">
            <Cpu size={14} />
            <span>Ensamblar</span>
          </button>
          <button className="btn" disabled title="Inciso 5: Ejecutar binario">
            <Play size={14} />
            <span>Ejecutar</span>
          </button>
        </div>
      </div>

      {/* Lado derecho: Ventana de Integrantes */}
      <div>
        <button className="btn btn-accent" onClick={onOpenMembers} title="Ver integrantes del proyecto">
          <Users size={14} />
          <span>Integrantes</span>
        </button>
      </div>
    </header>
  );
}
