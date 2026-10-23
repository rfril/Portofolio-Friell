import http from 'http';
import fs from 'fs';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function createPortfolioServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    let filePath = path.join(__dirname, reqPath);

    if (reqPath === '/' || reqPath === '') {
      filePath = path.join(__dirname, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });
}

function findAvailablePort(startPort, callback) {
  const tester = net.createServer();
  tester.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err, null);
    }
  });

  tester.once('listening', () => {
    tester.once('close', () => callback(null, startPort)).close();
  });

  tester.listen(startPort);
}

findAvailablePort(DEFAULT_PORT, (err, port) => {
  if (err) {
    console.error('Error finding port:', err);
    process.exit(1);
  }

  const app = createPortfolioServer();
  app.listen(port, () => {
    console.log(`=======================================================================`);
    console.log(`  PORTOFOLIO 3D INTERAKTIF RAFRIEL RADITYA WIDODO`);
    console.log(`  Server lokal aktif: http://localhost:${port}`);
    console.log(`  Mode Dokumen Standar: http://localhost:${port}/#classic`);
    console.log(`=======================================================================`);

    if (process.argv.includes('--open')) {
      const startCmd = process.platform === 'win32' ? 'start' : 'open';
      exec(`${startCmd} http://localhost:${port}`);
    }
  });
});
