const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');

module.exports = function ({ api }) {
  const vdgai = JSON.parse(fs.readFileSync('./includes/vdgai.json', 'utf8'));
  if (!global.client) global.client = {};
  if (!Array.isArray(global.client.queues)) global.client.queues = [];
  async function stream_url(url) {
    const res = await axios({ url, responseType: 'stream' });
    return res.data;
  }
  async function upload(url) {
    const res = await api.postFormData('https://upload.facebook.com/ajax/mercury/upload.php', {
      upload_1024: await stream_url(url),
      voice_clip: 'true'
    });
    const meta = res?.payload?.metadata?.[0];
    if (!meta || typeof meta !== 'object') return null;
    const entry = Object.entries(meta).find(([k, v]) => /_id$/.test(k) && (typeof v === 'string' || typeof v === 'number'));
    if (!entry) return null;
    return [entry[0], entry[1]];
  }
  let status = false;
  cron.schedule('*/5 * * * * *', async () => {
    if (status) return;
    status = true;
    try {
      if (global.client.queues.length < 20) {
        const itemsNeeded = Math.min(20 - global.client.queues.length, 5);
        const uploadPromises = Array.from({ length: itemsNeeded }, () => upload(vdgai[Math.floor(Math.random() * vdgai.length)]));
        const settled = await Promise.allSettled(uploadPromises);
        const ok = settled.filter(i => i.status === 'fulfilled' && i.value).map(i => i.value);
        if (ok.length) {
          console.log(ok);
          global.client.queues.push(...ok);
        }
      }
    } finally {
      status = false;
    }
  });
};
