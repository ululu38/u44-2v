fetch('http://localhost:3000/posts/sms-solutions-YwbET').then(r=>r.text()).then(t=>console.log(t.includes('name="description"') ? 'HAS DESCRIPTION' : 'NO DESCRIPTION'));
