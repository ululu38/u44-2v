fetch('http://localhost:3000/posts/sms-solutions-YwbET').then(r=>r.text()).then(t=>{ const matches = t.match(/<meta[^>]*name="description"[^>]*>/gi); console.log(matches); });
