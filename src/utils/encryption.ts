import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc'; 
const key = Buffer.from('2f3b0e8d2f4b47c1a8e1b25f3c7d879e4d6f9c1e8e473cf97f9d4f30a7d4c8e7', 'hex');
const iv = Buffer.from('8b79a54c2a4fbb0d6e2f6f8a574c9d2a', 'hex');

export function encrypt(text: string): string {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift()!, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
