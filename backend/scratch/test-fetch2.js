import http from 'http';
import fs from 'fs';

const urls = [
  'http://localhost:4000/media/uploads/hcu-logo-d694cea2-6395-40ca-ad81-3ee6d8be07e6-mini.webp', // failing
  'http://localhost:4000/media/uploads/292-20260215-141509-4557-4caf8d3f-16d5-47a2-8d0e-24940fe19e48-mini.webp' // working
];

const logStream = fs.createWriteStream('c:\\DEV\\u44tech-v2\\fetch_log.txt');

function fetchUrl(url, index) {
  if (index >= urls.length) {
    logStream.write('Done.\n');
    logStream.end();
    return;
  }
  
  logStream.write(`Fetching: ${url}\n`);
  
  const req = http.get(url, (res) => {
    logStream.write(`STATUS: ${res.statusCode}\n`);
    res.on('data', () => {}); // consume
    res.on('end', () => {
      fetchUrl(urls, index + 1);
    });
  });
  
  req.on('error', (e) => {
    logStream.write(`ERROR: ${e.message}\n`);
    fetchUrl(urls, index + 1);
  });
}

fetchUrl(urls[0], 0);
