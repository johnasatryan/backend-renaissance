const crypto = require('crypto');

const start = Date.now();

process.env.UV_THREADPOOL_SIZE = 8;
for (let i = 0; i < 16; ++i) {
  crypto.pbkdf2('password', 'salt', 1000000, 512, 'sha512', (err) => {
    console.log(`ird: ${i + 1} password`, Date.now() - start);
  });
}
