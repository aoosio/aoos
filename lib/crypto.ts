import crypto from 'crypto'
const SALT = 'aoos-whatsapp-kdf-v1'

export function encryptToken(plain: string, kmsKey: string) {
  const key = crypto.scryptSync(kmsKey, SALT, 32)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: ct.toString('base64'),
  })
}

export function decryptToken(payload: string, kmsKey: string) {
  const parsed = JSON.parse(payload) as { iv: string; tag: string; ct: string }
  const key = crypto.scryptSync(kmsKey, SALT, 32)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'))
  const pt = Buffer.concat([decipher.update(Buffer.from(parsed.ct, 'base64')), decipher.final()])
  return pt.toString('utf8')
}
