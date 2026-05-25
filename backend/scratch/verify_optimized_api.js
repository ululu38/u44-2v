const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing optimized API on localhost:4000...');
  
  try {
    // 1. Default request
    console.log('\n--- 1. Testing Default Request ---');
    const res1 = await get('http://localhost:4000/posts?limit=1');
    const post1 = res1.data[0];
    if (post1) {
      console.log('Keys returned:', Object.keys(post1));
      console.log('contentHtml present?:', post1.contentHtml !== undefined);
      console.log('content (legacy) present?:', post1.content !== undefined);
      console.log('contentText length:', post1.contentText ? post1.contentText.length : 0);
      console.log('contentText sample:', post1.contentText);
      if (post1.thumbnailMedia) {
        console.log('Thumbnail properties:', post1.thumbnailMedia);
      }
    } else {
      console.log('No posts returned.');
    }

    // 2. Custom fields request
    console.log('\n--- 2. Testing Custom Fields (fields=id,title) ---');
    const res2 = await get('http://localhost:4000/posts?limit=1&fields=id,title');
    const post2 = res2.data[0];
    if (post2) {
      console.log('Keys returned:', Object.keys(post2));
    }

    // 3. Custom thumbSize request (thumbSize=mini)
    console.log('\n--- 3. Testing Custom thumbSize (thumbSize=mini) ---');
    const res3 = await get('http://localhost:4000/posts?limit=1&thumbSize=mini');
    const post3 = res3.data[0];
    if (post3 && post3.thumbnailMedia) {
      console.log('Thumbnail url (should be mini):', post3.thumbnailMedia.urlThumb);
    }
    
  } catch (err) {
    console.log('Ensure the backend server is running on port 4000 before running verification.');
    console.error('Error:', err.message);
  }
}

run();
