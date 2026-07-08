import * as React from 'react'
import { toast } from 'sonner'
import * as draftService from '../services/propertyDraftService'
import {
  getDraftStorageKey,
  isRemoteNewer,
  readLocalDraft,
  removeLocalDraft,
  writeLocalDraft,
} from '../utils/draftStorage'

export function useDraftPersistence({
  draftType,
  propertyId,
  currentStep,
  getDraftData,
  restoreDraft,
  onDraftFound,
  debounceMs = 800,
  enabled = true,
}) {
  const storageKey = React.useMemo(
    () => getDraftStorageKey({ draftType, propertyId }),
    [draftType, propertyId],
  )
  const [draftId, setDraftId] = React.useState(null)
  const [draftMedia, setDraftMedia] = React.useState([])
  const [status, setStatus] = React.useState('idle')
  const saveTimerRef = React.useRef(null)

  const buildLocalDraft = React.useCallback(() => ({
    draftId,
    currentStep,
    updatedAt: new Date().toISOString(),
    draftData: getDraftData(),
    media: draftMedia,
  }), [currentStep, draftId, draftMedia, getDraftData])

  const applyDraft = React.useCallback((draftInfo) => {
    setDraftId(draftInfo.draftId || null)
    setDraftMedia(draftInfo.media || [])
    restoreDraft?.(draftInfo.draftData || {}, draftInfo.currentStep)
    if (draftInfo.isRemote) {
      toast.success('Your draft has been restored.')
    }
  }, [restoreDraft])

  const hasHandledDraftRef = React.useRef(false)

  React.useEffect(() => {
    if (!enabled) return

    let hasHandledLocal = false
    const local = readLocalDraft(storageKey)
    if (local && Object.keys(local.draftData || {}).length > 0) {
      const draftInfo = {
        draftId: local.draftId,
        media: local.media,
        draftData: local.draftData,
        currentStep: local.currentStep,
        isRemote: false
      }
      
      if (!hasHandledDraftRef.current) {
        hasHandledDraftRef.current = true
        if (onDraftFound) {
          onDraftFound(draftInfo, applyDraft)
        } else {
          window.setTimeout(() => applyDraft(draftInfo), 0)
        }
      }
      hasHandledLocal = true
    }

    let cancelled = false
    draftService.getPropertyDraft({
      draft_type: draftType,
      ...(draftType === 'Edit' ? { property_id: propertyId } : {}),
    }).then((res) => {
      if (cancelled || !res?.success || !res.data) return
      const remote = res.data
      const latestLocal = readLocalDraft(storageKey)
      
      if (isRemoteNewer(remote, latestLocal)) {
        const restored = {
          draftId: remote.id,
          currentStep: remote.current_step,
          updatedAt: remote.updated_at,
          draftData: remote.draft_data || {},
          media: remote.media || [],
          isRemote: true
        }
        writeLocalDraft(storageKey, restored)
        if (!hasHandledDraftRef.current) {
            hasHandledDraftRef.current = true
            if (onDraftFound) {
              onDraftFound(restored, applyDraft)
            } else {
              applyDraft(restored)
            }
        }
      } else {
        if (!hasHandledLocal) {
          setDraftId(remote.id)
          setDraftMedia(remote.media || [])
        } else if (remote.id && !latestLocal?.draftId) {
          setDraftId(remote.id)
        }
      }
    }).catch(() => {})

    return () => { cancelled = true }
  }, [draftType, enabled, propertyId, applyDraft, onDraftFound, storageKey])

  const saveLocal = React.useCallback(() => {
    if (!enabled) return null
    const draft = buildLocalDraft()
    writeLocalDraft(storageKey, draft)
    return draft
  }, [buildLocalDraft, enabled, storageKey])

  const scheduleLocalSave = React.useCallback(() => {
    if (!enabled) return
    setStatus('saving')
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveLocal()
      setStatus('saved')
    }, debounceMs)
  }, [debounceMs, enabled, saveLocal])

  const syncBackend = React.useCallback(async (stepOverride) => {
    if (!enabled) return null
    const local = saveLocal()
    setStatus('saving')
    const res = await draftService.upsertPropertyDraft({
      draft_type: draftType,
      property_id: draftType === 'Edit' ? propertyId : undefined,
      current_step: stepOverride || local.currentStep,
      draft_data: local.draftData,
    })
    if (res?.success) {
      setDraftId(res.data.id)
      const synced = { ...local, draftId: res.data.id, updatedAt: res.data.updated_at }
      writeLocalDraft(storageKey, synced)
      setStatus('saved')
      return res.data
    }
    setStatus('error')
    return null
  }, [draftType, enabled, propertyId, saveLocal, storageKey])

  const clearDraft = React.useCallback(async (specificDraftId = null) => {
    removeLocalDraft(storageKey)
    const idToDelete = specificDraftId || draftId
    setDraftId(null)
    setDraftMedia([])
    
    // Attempt to delete draft from backend as well
    if (idToDelete) {
      try {
        await draftService.deletePropertyDraft(idToDelete)
      } catch (err) {
        // Ignore errors for cleanup
      }
    } else {
      try {
        const res = await draftService.getPropertyDraft({
          draft_type: draftType,
          ...(draftType === 'Edit' ? { property_id: propertyId } : {}),
        })
        if (res?.data?.id) {
          await draftService.deletePropertyDraft(res.data.id)
        }
      } catch (err) {}
    }
  }, [storageKey, draftId, draftType, propertyId])

  React.useEffect(() => () => window.clearTimeout(saveTimerRef.current), [])

  return {
    draftId,
    setDraftId,
    draftMedia,
    setDraftMedia,
    status,
    saveLocal,
    scheduleLocalSave,
    syncBackend,
    clearDraft,
    storageKey,
  }
}

