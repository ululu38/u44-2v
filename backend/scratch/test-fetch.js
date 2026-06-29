import http from 'http';

http.get('http://localhost:4000/media/uploads/hcu-logo-d694cea2-6395-40ca-ad81-3ee6d8be07e6-mini.webp', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.length} bytes`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
