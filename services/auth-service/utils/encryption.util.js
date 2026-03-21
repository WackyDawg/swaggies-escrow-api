import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm';

// In production, this MUST come from your .env file
// It must be exactly 32 bytes (256 bits) long. 
// You can generate one in your terminal using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const getEncryptionKey = () => Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}


function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;

  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encryption format');

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export { encrypt, decrypt };