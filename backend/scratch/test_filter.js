// Use global fetch

async function test() {
  const [postsRes, clientsRes] = await Promise.all([
    fetch('http://localhost:4000/posts?page=1&limit=200&tag=Project&status=1&fields=postId,clients').then(r => r.json()),
    fetch('http://localhost:4000/clients?page=1&limit=1000&fields=clientId,name,groups').then(r => r.json())
  ]);

  const postsData = postsRes.data || [];
  const clientsData = clientsRes.data || [];

  const groupMap = new Map();
  const companyMap = new Map();
  const cgMap = new Map();

  clientsData.forEach(c => {
    companyMap.set(c.clientId, { name: c.name, count: 0 });
    (c.groups || []).forEach(g => {
      if (!groupMap.has(g.groupId)) groupMap.set(g.groupId, { name: g.name, count: 0 });
      if (!cgMap.has(c.clientId)) cgMap.set(c.clientId, new Set());
      cgMap.get(c.clientId).add(g.groupId);
    });
  });

  console.log("Posts count:", postsData.length);
  if (postsData.length > 0) {
    console.log("First post clients:", JSON.stringify(postsData[0].clients, null, 2));
  }

  postsData.forEach(p => {
    const processedGroups = new Set();
    (p.clients || []).forEach(c => {
      if (companyMap.has(c.clientId)) {
        companyMap.get(c.clientId).count++;
        const groups = cgMap.get(c.clientId);
        if (groups) {
          groups.forEach(gid => {
            if (!processedGroups.has(gid)) {
              if (groupMap.has(gid)) groupMap.get(gid).count++;
              processedGroups.add(gid);
            }
          });
        }
      }
    });
  });

  const finalClients = [...groupMap.entries()].filter(([, v]) => v.count > 0).map(([id, v]) => ({ id, ...v }));
  const finalCompanies = [...companyMap.entries()].filter(([, v]) => v.count > 0).map(([id, v]) => ({ id, ...v }));
  
  console.log('Final Clients:', finalClients);
  console.log('Final Companies:', finalCompanies);
}

test();
