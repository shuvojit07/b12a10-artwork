export function validatePassword(password){
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const isLong = typeof password === 'string' && password.length >= 6
  return { ok: hasUpper && hasLower && isLong, hasUpper, hasLower, isLong }
}
