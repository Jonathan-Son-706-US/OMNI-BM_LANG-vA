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
// INCISO 2: Generar Código Intermedio (TAC) mediante Tuberías
// ------------------------------------------------------------------

function buildCompilerIfNeeded() {
  return new Promise((resolve, reject) => {
    const compilerPath = path.join(ROOT_DIR, 'compilador');
    if (fs.existsSync(compilerPath)) {
      return resolve(compilerPath);
    }
    console.log('[Compilador] Construyendo binario ./compilador...');
    exec('flex proyecto.l && bison -d proyecto.y && gcc lex.yy.c proyecto.tab.c -o compilador', { cwd: ROOT_DIR }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Error al construir compilador: ${stderr || err.message}`));
      }
      resolve(compilerPath);
    });
  });
}

app.post('/api/compile/tac', async (req, res) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Código fuente no suministrado' });
    }

    const compilerPath = await buildCompilerIfNeeded();

    // Ejecución mediante tubería en Linux (child_process stdin pipe)
    const child = spawn(compilerPath, [], { cwd: ROOT_DIR });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      res.status(500).json({ success: false, error: `Fallo al iniciar el proceso: ${err.message}` });
    });

    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        res.json({
          success: true,
          tac: stdoutData,
          stderr: stderrData,
          exitCode,
        });
      } else {
        res.json({
          success: false,
          tac: stdoutData,
          error: stderrData || 'Error sintáctico o léxico durante el análisis.',
          exitCode,
        });
      }
    });

    // Enviar código fuente por la tubería de entrada estándar (stdin)
    child.stdin.write(code);
    child.stdin.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------
// INCISO 3: Generar Código Assembler NASM
// ------------------------------------------------------------------

// Compilar y obtener código ensamblador (salida.asm)
app.post('/api/compile/asm', async (req, res) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Código fuente no suministrado' });
    }

    const compilerPath = await buildCompilerIfNeeded();
    const child = spawn(compilerPath, [], { cwd: ROOT_DIR });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      res.status(500).json({ success: false, error: `Fallo al iniciar compilador: ${err.message}` });
    });

    child.on('close', (exitCode) => {
      const asmPath = path.join(ROOT_DIR, 'salida.asm');
      if (exitCode === 0 && fs.existsSync(asmPath)) {
        const asmContent = fs.readFileSync(asmPath, 'utf-8');
        res.json({
          success: true,
          asm: asmContent,
          tac: stdoutData,
          filename: 'salida.asm',
          exitCode,
        });
      } else {
        res.json({
          success: false,
          error: stderrData || 'Error al generar código ensamblador.',
          exitCode,
        });
      }
    });

    // Enviar código por tubería al compilador
    child.stdin.write(code);
    child.stdin.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leer archivo salida.asm existente
app.get('/api/compile/asm', (req, res) => {
  try {
    const asmPath = path.join(ROOT_DIR, 'salida.asm');
    if (!fs.existsSync(asmPath)) {
      return res.status(404).json({ success: false, error: 'salida.asm aún no ha sido generado' });
    }
    const asmContent = fs.readFileSync(asmPath, 'utf-8');
    res.json({ success: true, asm: asmContent, filename: 'salida.asm' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------
// INCISO 4: Generar Código Ejecutable (NASM + LD)
// ------------------------------------------------------------------

function executeCompilerPipe(code) {
  return new Promise(async (resolve, reject) => {
    try {
      const compilerPath = await buildCompilerIfNeeded();
      const child = spawn(compilerPath, [], { cwd: ROOT_DIR });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (chunk) => { stdoutData += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderrData += chunk.toString(); });

      child.on('error', (err) => reject(new Error(`Fallo al ejecutar compilador: ${err.message}`)));

      child.on('close', (exitCode) => {
        if (exitCode === 0) {
          resolve({ stdout: stdoutData, stderr: stderrData });
        } else {
          reject(new Error(stderrData || 'Error de sintaxis durante el análisis léxico/sintáctico.'));
        }
      });

      child.stdin.write(code);
      child.stdin.end();
    } catch (e) {
      reject(e);
    }
  });
}

app.post('/api/compile/executable', async (req, res) => {
  try {
    const { code } = req.body;

    // Si se envía código fuente, compilar primero a salida.asm mediante tubería
    if (typeof code === 'string' && code.trim().length > 0) {
      try {
        await executeCompilerPipe(code);
      } catch (compileErr) {
        return res.status(400).json({
          success: false,
          error: `Error de compilación: ${compileErr.message}`,
        });
      }
    }

    const asmPath = path.join(ROOT_DIR, 'salida.asm');
    if (!fs.existsSync(asmPath)) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró salida.asm. Genera el código NASM primero.',
      });
    }

    // Paso 1: Ensamblar con NASM
    exec('nasm -f elf32 salida.asm -o salida.o', { cwd: ROOT_DIR }, (nasmErr, nasmStdout, nasmStderr) => {
      if (nasmErr) {
        return res.status(500).json({
          success: false,
          error: `Error durante el ensamblado con NASM: ${nasmStderr || nasmErr.message}`,
          phase: 'nasm',
        });
      }

      // Paso 2: Enlazar con LD (Linux 32-bit ELF)
      exec('ld -m elf_i386 salida.o -o salida', { cwd: ROOT_DIR }, (ldErr, ldStdout, ldStderr) => {
        if (ldErr) {
          return res.status(500).json({
            success: false,
            error: `Error durante el enlace con LD: ${ldStderr || ldErr.message}`,
            phase: 'ld',
          });
        }

        const binPath = path.join(ROOT_DIR, 'salida');
        const exists = fs.existsSync(binPath);

        const timestamp = new Date().toLocaleTimeString();
        const logs = [
          `[${timestamp}] Iniciando generación de binario ejecutable...`,
          `✓ [1/2] nasm -f elf32 salida.asm -o salida.o  (Ensamblado exitoso)`,
          `✓ [2/2] ld -m elf_i386 salida.o -o salida       (Enlace ELF i386 exitoso)`,
          `----------------------------------------------------------------`,
          `➜ Archivo ejecutable creado: ./salida (32-bit Linux ELF)`,
          `➜ El ejecutable está listo para correr en la pestaña Consola.`
        ].join('\n');

        res.json({
          success: true,
          message: 'Código ejecutable generado exitosamente con NASM y LD.',
          logs,
          binary: 'salida',
          exists,
        });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------
// INCISO 5: Ejecutar el Binario Creado (./salida)
// ------------------------------------------------------------------

function buildExecutable(code) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof code === 'string' && code.trim().length > 0) {
        await executeCompilerPipe(code);
      }
      exec('nasm -f elf32 salida.asm -o salida.o && ld -m elf_i386 salida.o -o salida', { cwd: ROOT_DIR }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Fallo al ensamblar/enlazar: ${stderr || err.message}`));
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

app.post('/api/run', async (req, res) => {
  try {
    const { input, code, autoBuild } = req.body;
    const binPath = path.join(ROOT_DIR, 'salida');

    // Si no existe el binario o se solicita autoBuild
    if (!fs.existsSync(binPath) || autoBuild) {
      try {
        await buildExecutable(code);
      } catch (buildErr) {
        return res.status(400).json({
          success: false,
          error: `Error al preparar el ejecutable: ${buildErr.message}`,
        });
      }
    }

    const startTime = Date.now();
    const child = spawn(binPath, [], { cwd: ROOT_DIR });

    let stdoutData = '';
    let stderrData = '';
    let isTerminated = false;

    // Timeout de seguridad: 6 segundos para evitar procesos colgados
    const timer = setTimeout(() => {
      isTerminated = true;
      child.kill('SIGKILL');
    }, 6000);

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      res.status(500).json({ success: false, error: `Error al ejecutar ./salida: ${err.message}` });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(3);

      if (isTerminated) {
        return res.json({
          success: false,
          stdout: stdoutData,
          stderr: stderrData,
          error: 'Tiempo límite excedido (Timeout 6s). El programa posiblemente está esperando datos en READ o entró en un ciclo infinito. Ingresa los números en el campo "Entrada (stdin)" y vuelve a presionar Ejecutar.',
          exitCode: 124,
          executionTime,
        });
      }

      res.json({
        success: exitCode === 0,
        stdout: stdoutData,
        stderr: stderrData,
        exitCode,
        executionTime,
      });
    });

    // Enviar valores de entrada a stdin para sentencias READ
    if (typeof input === 'string' && input.trim().length > 0) {
      const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
      const formattedInput = tokens.join('\n') + '\n';
      child.stdin.write(formattedInput);
    }
    child.stdin.end();

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
