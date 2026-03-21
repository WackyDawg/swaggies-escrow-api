import { nanoid } from 'nanoid';

export const generateP2PReference = (type, randomLength = 12) => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  const randomPart = nanoid(randomLength)

  return `SWG_P2P_${type}-${yyyy}${mm}${dd}-${randomPart}`
}

export const generateDisburseReference = (randomLength = 12) => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  const randomPart = nanoid(randomLength)

  return `SWG_DISB_OUT-${yyyy}${mm}${dd}-${randomPart}`
}