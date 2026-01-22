// Script para gerar uma chave JWT segura
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('base64');

console.log('\n🔐 Chave JWT gerada com sucesso!\n');
console.log('Copie e cole no Vercel como JWT_SECRET:\n');
console.log(secret);
console.log('\n');
