/** Admin dashboard URL (separate Vite app on port 8002 in dev). */
export const ADMIN_APP_URL =
  import.meta.env.VITE_ADMIN_URL || 'http://localhost:8002'

export function getAdminLoginUrl() {
  return `${ADMIN_APP_URL}/login`
}
