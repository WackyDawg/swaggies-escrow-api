import { nanoid } from 'nanoid';

export function generateTransactionId() {
  return `TXN-${nanoid(16)}`.toUpperCase();
}

export function generateWalletRef() {
  return `WAL-${nanoid(16)}`.toUpperCase();
}

export function generateWalletName() {
  return `WALLET-${nanoid(10)}`.toUpperCase();
}
