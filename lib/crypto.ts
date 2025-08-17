// lib/crypto.ts
import crypto from 'crypto'

function getKey(): Buffer {
  const raw = process.env.WHATSAPP_KMS_KEY || process.env.KMS_KEY || ''
  if (!raw) throw new Error('Missing WHATSAPP_KMS_KEY')
  // Derive a 32-byte key from provided secret (stable)
  return crypto.scryptSync(raw, 'aoos-whatsapp-kdf', 32)
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${enc.toString('base64url')}.${tag.toString('base64url')}`
}

export function decryptToken(blob: string): string {
  const key = getKey()
  const [ivB64, dataB64, tagB64] = String(blob).split('.')
  if (!ivB64 || !dataB64 || !tagB64) throw new Error('Bad token blob')
  const iv = Buffer.from(ivB64, 'base64url')
  const data = Buffer.from(dataB64, 'base64url')
  const tag = Buffer.from(tagB64, 'base64url')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}

export function maskToken(t?: string | null) {
  if (!t) return { masked: null, hint: null }
  const hint = t.slice(-4)
  const masked = `••••••••••••••••${hint}`
  return { masked, hint }
}
