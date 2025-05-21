import https from 'https';

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log('Public IP:', ip);
    } catch (e) {
      console.error('Error parsing IP response:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching IP:', err);
});
