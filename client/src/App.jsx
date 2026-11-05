import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EditorPanel from './components/EditorPanel';
import OutputPanel from './components/OutputPanel';
import MembersModal from './components/MembersModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentFilename, setCurrentFilename] = useState('test_a.bml');
  const [code, setCode] = useState('');
  const [savedCode, setSavedCode] = useState('');
  const [filesList, setFilesList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState('tac');
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);

  // Estados para Código Intermedio (Inciso 2)
  const [tacOutput, setTacOutput] = useState('');
  const [tacError, setTacError] = useState('');
  const [isGeneratingTac, setIsGeneratingTac] = useState(false);

  // Estados para Assembler NASM (Inciso 3)
  const [asmOutput, setAsmOutput] = useState('');
  const [asmError, setAsmError] = useState('');
  const [isGeneratingAsm, setIsGeneratingAsm] = useState(false);

  // Estados para Ejecutable / Consola (Inciso 4)
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [isAssembling, setIsAssembling] = useState(false);

  const isModified = code !== savedCode;

  // Mostrar notificación toast temporal
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Cargar lista de archivos del backend
  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFilesList(data.files || []);
        setServerOnline(true);
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setServerOnline(false);
    }
  };

  // Cargar contenido de un archivo
  const loadFile = async (filename) => {
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(filename)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentFilename(data.filename);
        setCode(data.content);
        setSavedCode(data.content);
        showToast(`Archivo "${data.filename}" cargado`);
      } else {
        showToast(`No se pudo cargar "${filename}"`, 'error');
      }
    } catch (err) {
      showToast(`Error de conexión con el servidor`, 'error');
    }
  };

  // Inicializar: buscar archivos y cargar el primero (o test_a.bml)
  useEffect(() => {
    fetchFiles();
    loadFile('test_a.bml');
  }, []);

  // Crear nuevo archivo .bml
  const handleNewFile = () => {
    const inputName = window.prompt(
      'Ingresa el nombre del nuevo archivo (con o sin extensión .bml):',
      'nuevo_programa.bml'
    );
    if (!inputName) return;

    let filename = inputName.trim();
    if (!filename.endsWith('.bml')) {
      filename += '.bml';
    }

    const template = `MAIN {\n    DEC $x, $y, $resultado;\n    $x => 15;\n    $y => 30;\n    $resultado => $x + $y;\n    WRITE $resultado;\n}\n`;
    setCurrentFilename(filename);
    setCode(template);
    setSavedCode(''); // Se marca como modificado hasta guardar
    showToast(`Nuevo archivo "${filename}" creado. Presiona Guardar para confirmar.`);
  };

  // Guardar archivo actual en el servidor
  const handleSaveFile = async () => {
    if (!currentFilename) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentFilename,
          content: code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedCode(code);
        showToast(data.message || `Archivo guardado`);
        fetchFiles();
      } else {
        showToast(data.error || 'Error al guardar', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Descargar archivo al equipo del usuario
  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFilename || 'codigo.bml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Descargando "${currentFilename}"`);
  };

  // Cargar archivo subido desde el equipo local
  const handleUploadFile = (name, content) => {
    setCurrentFilename(name);
    setCode(content);
    setSavedCode('');
    showToast(`Archivo "${name}" cargado desde tu equipo.`);
  };

  // Generar Código Intermedio (TAC) mediante tuberías (Inciso 2)
  const handleGenerateTac = async () => {
    if (!code.trim()) {
      showToast('El editor está vacío', 'error');
      return;
    }
    setIsGeneratingTac(true);
    try {
      const res = await fetch('/api/compile/tac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setTacOutput(data.tac);
        setTacError('');
        setActiveOutputTab('tac');
        showToast('Código Intermedio (TAC) generado exitosamente');
      } else {
        setTacOutput(data.tac || '');
        setTacError(data.error || 'Error sintáctico o léxico durante el análisis');
        setActiveOutputTab('tac');
        showToast(data.error || 'Error al compilar código TAC', 'error');
      }
    } catch (err) {
      showToast('Error de conexión con el compilador', 'error');
    } finally {
      setIsGeneratingTac(false);
    }
  };

  // Generar Código Assembler NASM (Inciso 3)
  const handleGenerateAsm = async () => {
    if (!code.trim()) {
      showToast('El editor está vacío', 'error');
      return;
    }
    setIsGeneratingAsm(true);
    try {
      const res = await fetch('/api/compile/asm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setAsmOutput(data.asm);
        setAsmError('');
        if (data.tac) setTacOutput(data.tac);
        setActiveOutputTab('asm');
        showToast('Código Assembler NASM (salida.asm) generado exitosamente');
      } else {
        setAsmOutput('');
        setAsmError(data.error || 'Error al generar código ensamblador');
        setActiveOutputTab('asm');
        showToast(data.error || 'Error al generar código NASM', 'error');
      }
    } catch (err) {
      showToast('Error de conexión con el compilador', 'error');
    } finally {
      setIsGeneratingAsm(false);
    }
  };

  // Ensamblar código ejecutable con NASM + LD (Inciso 4)
  const handleAssemble = async () => {
    if (!code.trim()) {
      showToast('El editor está vacío', 'error');
      return;
    }
    setIsAssembling(true);
    try {
      const res = await fetch('/api/compile/executable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setConsoleOutput(data.logs);
        setConsoleError('');
        setActiveOutputTab('console');
        showToast('Ejecutable generado exitosamente con NASM y LD');
      } else {
        setConsoleOutput('');
        setConsoleError(data.error || 'Error al ensamblar el ejecutable');
        setActiveOutputTab('console');
        showToast(data.error || 'Fallo durante el ensamblado o enlace', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al ensamblar', 'error');
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="ide-container">
      {/* Barra de navegación superior */}
      <Navbar
        currentFilename={currentFilename}
        onNewFile={handleNewFile}
        onOpenFile={loadFile}
        onSaveFile={handleSaveFile}
        onDownloadFile={handleDownloadFile}
        onUploadFile={handleUploadFile}
        filesList={filesList}
        isSaving={isSaving}
        isModified={isModified}
        onOpenMembers={() => setIsMembersOpen(true)}
        onGenerateTac={handleGenerateTac}
        isGeneratingTac={isGeneratingTac}
        onGenerateAsm={handleGenerateAsm}
        isGeneratingAsm={isGeneratingAsm}
        onAssemble={handleAssemble}
        isAssembling={isAssembling}
      />

      {/* Espacio de trabajo en una sola ventana (Editor + Paneles de Salida) */}
      <main className="ide-workspace">
        <EditorPanel
          filename={currentFilename}
          code={code}
          onChange={setCode}
          onSave={handleSaveFile}
          isModified={isModified}
        />
        <OutputPanel
          activeTab={activeOutputTab}
          onTabChange={setActiveOutputTab}
          tacOutput={tacOutput}
          tacError={tacError}
          asmOutput={asmOutput}
          asmError={asmError}
          consoleOutput={consoleOutput}
          consoleError={consoleError}
        />
      </main>

      {/* Barra de estado inferior */}
      <footer className="status-bar">
        <div className="status-bar-left">
          <div className="status-item">
            <span
              className={`file-status-indicator ${serverOnline ? '' : 'modified'}`}
              style={{ width: 6, height: 6 }}
            />
            <span style={{ color: serverOnline ? 'var(--green-primary)' : '#f59e0b' }}>
              {serverOnline ? 'Backend Activo (Puerto 3001)' : 'Desconectado del servidor'}
            </span>
          </div>
          <div className="status-item">
            <span>Archivo: <strong>{currentFilename}</strong></span>
          </div>
        </div>
        <div className="status-bar-right">
          <div className="status-item">
            <span>Guardar: <kbd style={{ background: '#232a26', padding: '1px 4px', borderRadius: 3 }}>Ctrl + S</kbd></span>
          </div>
          <div className="status-item">
            <span>Lenguaje: <strong>OMNI-BML</strong></span>
          </div>
        </div>
      </footer>

      {/* Modal de Integrantes */}
      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />

      {/* Notificaciones flotantes tipo Toast */}
      {toast && (
        <div className="toast-container">
          <div
            className="toast"
            style={{
              borderLeftColor: toast.type === 'error' ? '#ef4444' : 'var(--green-primary)',
            }}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} color="#ef4444" />
            ) : (
              <CheckCircle2 size={16} color="var(--green-primary)" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
