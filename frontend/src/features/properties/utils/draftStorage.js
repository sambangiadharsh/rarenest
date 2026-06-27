export function getDraftStorageKey({ draftType, propertyId }) {
  return draftType === 'Edit' ? `property-edit-${propertyId}` : 'property-create-draft'
}

export function readLocalDraft(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLocalDraft(key, draft) {
  window.localStorage.setItem(key, JSON.stringify(draft))
}

export function removeLocalDraft(key) {
  window.localStorage.removeItem(key)
}

export function isRemoteNewer(remote, local) {
  if (!remote?.updated_at) return false
  if (!local?.updatedAt) return true
  return new Date(remote.updated_at).getTime() > new Date(local.updatedAt).getTime()
}
