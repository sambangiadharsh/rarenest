export function mapApiUserToCredentials(user) {
  return {
    id: user.id,
    name:
      `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
      user.email?.split('@')[0] ||
      'User',
    email: user.email,
    role: (user.role || 'Buyer').toLowerCase(),
  }
}
