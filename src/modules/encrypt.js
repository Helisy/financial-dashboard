require('dotenv').config();

const crypto = require('crypto');

//const key =  "43Ezo18XmTtEkJ5k";
const key = process.env.CRYPTO_SECRETE

console.log(key);


function Encrypt(value){
    const iv = Buffer.from(crypto.randomBytes(16));   
    var cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), iv);
    var encrypted = cipher.update(value, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function Decrypt(value){
    const [iv, encrypted] = value.split(':');
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), ivBuffer);
    var content = decipher.update(Buffer.from(encrypted, 'hex'));
    content += decipher.final('utf8');
    return content;
}

//console.log(Decrypt('bde0af19ae293541f6eb341fcdf04ff2:79ba9d86be3630b05f5cd350bd27a595'));

module.exports = {Encrypt, Decrypt};

