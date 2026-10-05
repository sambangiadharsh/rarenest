import React, { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function ImageLightboxModal({
  isOpen,
  onClose,
  mediaItems = [],
  currentIndex = 0,
  onIndexChange,
  title = 'Property Gallery',
}) {
  const total = mediaItems.length

  const handleNext = useCallback(() => {
    if (total <= 1) return
    onIndexChange((currentIndex + 1) % total)
  }, [currentIndex, total, onIndexChange])

  const handlePrev = useCallback(() => {
    if (total <= 1) return
    onIndexChange((currentIndex - 1 + total) % total)
  }, [currentIndex, total, onIndexChange])

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, handleNext, handlePrev])

  if (!isOpen || !mediaItems.length) return null

  const currentMedia = mediaItems[currentIndex] || mediaItems[0]

  const copyImageLink = () => {
    if (currentMedia?.src) {
      navigator.clipboard.writeText(currentMedia.src)
      toast.success('Image URL copied to clipboard!')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-2 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Main Card Container inspired by reference image */}
      <div
        className="relative flex flex-col w-full max-w-[96vw] h-[95vh] max-h-[950px] bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-brand-sand dark:border-slate-800 bg-brand-cream dark:bg-slate-950">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-full bg-brand-terracotta/20 text-brand-terracotta border border-brand-terracotta/30 text-xs font-bold shrink-0">
              {currentIndex + 1} / {total}
            </span>
            <h3 className="text-sm sm:text-base font-semibold truncate text-slate-800 dark:text-neutral-200">
              {title}
            </h3>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyImageLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors text-slate-700 dark:text-neutral-200 shadow-sm"
              title="Copy Image URL"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Center Display Area */}
        <div className="relative flex-1 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/50 p-2 sm:p-4 overflow-hidden select-none">
          {currentMedia.type === 'Video' ? (
            <video
              src={currentMedia.src}
              controls
              autoPlay
              className="max-h-[78vh] w-full max-w-full object-contain rounded-lg shadow-xl"
            />
          ) : (
            <img
              src={currentMedia.src}
              alt={`${title} - ${currentIndex + 1}`}
              className="max-h-[78vh] w-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
            />
          )}

          {/* Navigation Arrows */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg transition-all active:scale-95 group"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg transition-all active:scale-95 group"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}
        </div>

        {/* Footer Thumbnails Strip */}
        {total > 1 && (
          <div className="px-4 py-3 bg-brand-cream dark:bg-slate-950 border-t border-brand-sand dark:border-slate-800 flex items-center gap-2 overflow-x-auto justify-center">
            {mediaItems.map((item, idx) => (
              <button
                key={`${item.src}-${idx}`}
                type="button"
                onClick={() => onIndexChange(idx)}
                className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === idx
                    ? 'border-brand-terracotta scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
              >
                {item.type === 'Video' ? (
                  <video
                    src={item.src}
                    muted
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
