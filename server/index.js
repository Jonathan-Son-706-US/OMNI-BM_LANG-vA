const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const app = express();
const PORT = 3001;
const ROOT_DIR = path.resolve(__dirname, '..');

app.use(cors());
app.use(express.json());

// Seguridad básica: evitar salir del directorio raíz
function getSafePath(filename) {
  const safeName = path.basename(filename);
  return path.join(ROOT_DIR, safeName);
}

// ------------------------------------------------------------------
// INCISO 1: Abrir, Editar y Guardar archivos .bml
// ------------------------------------------------------------------

// Listar archivos .bml y .txt en el proyecto
app.get('/api/files', (req, res) => {
  try {
    const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && (e.name.endsWith('.bml') || e.name.endsWith('.txt')))
      .map((e) => ({
        name: e.name,
        isBml: e.name.endsWith('.bml'),
      }));
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leer contenido de un archivo
app.get('/api/files/:filename', (req, res) => {
  try {
    const filePath = getSafePath(req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, filename: req.params.filename, content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guardar archivo .bml
app.post('/api/files', (req, res) => {
  try {
    let { filename, content } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Nombre de archivo requerido' });
    }
    if (!filename.endsWith('.bml') && !filename.endsWith('.txt')) {
      filename += '.bml';
    }
    const filePath = getSafePath(filename);
    fs.writeFileSync(filePath, content || '', 'utf-8');
    res.json({ success: true, filename, message: `Archivo ${filename} guardado exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------
// Healthcheck
// ------------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', service: 'OMNI-BM_LANG Server' });
});

app.listen(PORT, () => {
  console.log(`[OMNI-BM_LANG Server] escuchando en http://localhost:${PORT}`);
});
