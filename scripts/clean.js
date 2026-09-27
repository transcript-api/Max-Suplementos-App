import fs from 'fs';

try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('server.js')) {
    fs.unlinkSync('server.js');
  }
  console.log('[Clean] Directorio dist eliminado correctamente.');
} catch (err) {
  console.error('[Clean] Error limpiando directorio:', err);
}
