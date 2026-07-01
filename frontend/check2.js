fetch('http://localhost:3000/posts/sms-solutions-YwbET').then(r=>r.text()).then(t=>{ const match = t.match(/<meta[^>]*name="description"[^>]*>/i); console.log(match ? match[0] : 'None'); });
