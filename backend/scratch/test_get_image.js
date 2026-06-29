async function testGetImage() {
  const url = 'http://localhost:8080/media/uploads/157-20250116-201216-3205-33bf457d-e8f6-4825-ad83-33391fa3a565-mini.webp';
  try {
    const res = await fetch(url);
    console.log(`📡 GET ${url} -> Status: ${res.status}`);
    if (!res.ok) {
      console.log('Error text:', await res.text());
    } else {
      console.log('Headers:', Object.fromEntries(res.headers.entries()));
      const buf = await res.arrayBuffer();
      console.log(`Success! Buffer size: ${buf.byteLength} bytes`);
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err);
  }
}

testGetImage();
