export const hashStr = async (s: string, algo = 'SHA-256') => {
  if (!window || !('crypto' in window)) return s
  const buffer = await window.crypto.subtle.digest(algo, new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}