// lib/crypto.ts
import crypto from 'crypto'

function getKey(): Buffer {
  const raw = process.env.WHATSAPP_KMS_KEY || process.env.KMS_KEY || ''
  if (!raw) throw new Error('Missing WHATSAPP_KMS_KEY')
  // Derive a 32-byte key from whatever was provided (stable)
  return crypto.scryptSync(raw, 'aoos-whatsapp-kdf', 32)
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // v1:iv:cipher:tag (all base64url)
  const b64 = (b: Buffer) => b.toString('base64url')
  return `v1:${b64(iv)}:${b64(enc)}:${b64(tag)}`
}

export function decryptToken(blob: string): string {
  const [v, ivB64, dataB64, tagB64] = (blob || '').split(':')
  if (v !== 'v1') throw new Error('Bad token format')
  const key = getKey()
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
