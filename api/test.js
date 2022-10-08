const crypto = require('crypto');
require('dotenv').config();
const randomstring = require('randomstring');
//const key = crypto.randomBytes(32).toString('utf8').substring(0, 32);
const iv = randomstring.generate(16);
//const iv = crypto.randomBytes(16);
const key = process.env.KEY;
console.log('iv', iv);
console.log('key', key);

const data = JSON.stringify({ username: 'john', password: 'abc' });

let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(data)
encrypted = Buffer.concat([encrypted, cipher.final()]).toString('hex');
console.log(encrypted);

encrypted = Buffer.from(encrypted, 'hex');
let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted);
decrypted = Buffer.concat([decrypted, decipher.final()]).toString();

console.log(JSON.parse(decrypted));

