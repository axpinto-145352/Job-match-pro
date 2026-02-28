import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const ENCODING: BufferEncoding = 'hex'

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  // The key must be 32 bytes for AES-256. Accept hex-encoded (64 chars) or
  // raw 32-byte strings.
  if (key.length === 64) {
    return Buffer.from(key, 'hex')
  }
  if (key.length === 32) {
    return Buffer.from(key, 'utf-8')
  }
  throw new Error(
    'ENCRYPTION_KEY must be either 32 bytes (raw) or 64 hex characters'
  )
}

/**
 * Encrypts plaintext using AES-256-GCM.
 *
 * @param text - The plaintext string to encrypt
 * @returns A hex-encoded string in the format `iv:authTag:ciphertext`
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf-8', ENCODING)
  encrypted += cipher.final(ENCODING)

  const authTag = cipher.getAuthTag()

  return [
    iv.toString(ENCODING),
    authTag.toString(ENCODING),
    encrypted,
  ].join(':')
}

/**
 * Decrypts a string that was encrypted with the `encrypt` function.
 *
 * @param encryptedText - The hex-encoded `iv:authTag:ciphertext` string
 * @returns The original plaintext string
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()

  const parts = encryptedText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format. Expected iv:authTag:ciphertext')
  }

  const [ivHex, authTagHex, ciphertext] = parts

  const iv = Buffer.from(ivHex, ENCODING)
  const authTag = Buffer.from(authTagHex, ENCODING)

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`)
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH} bytes`)
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, ENCODING, 'utf-8')
  decrypted += decipher.final('utf-8')

  return decrypted
}
