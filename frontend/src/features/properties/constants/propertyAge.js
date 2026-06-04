export function formatPropertyAge(years) {
  const n = Number(years)
  if (Number.isNaN(n) || n < 0) return null
  if (n === 0) return 'New construction'
  if (n === 1) return '1 year'
  return `${n} years`
}
