import { nanoid } from 'nanoid';
import crypto from 'crypto';  

export function generateTransactionId() {
  return `TXN-${nanoid(16)}`.toUpperCase(); 
}

export function generateWalletRef() {
  return `WAL-${nanoid(16)}`.toUpperCase();
}

export function generateWalletName() {
  return `WALLET-${nanoid(10)}`.toUpperCase();
}

export function generateTxRef(prefix = "trx") {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${prefix}-${timestamp}-${random}`;
}