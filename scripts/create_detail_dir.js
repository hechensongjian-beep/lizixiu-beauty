// @ts-check
const { mkdir } = require('fs');
const { join } = require('path');
const dir = join(__dirname, 'app', 'products', '[id]');
mkdir(dir, { recursive: true }, (err) => {
  if (err) console.error('mkdir error:', err);
  else console.log('Created:', dir);
});
