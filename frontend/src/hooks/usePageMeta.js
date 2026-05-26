import { useEffect } from 'react'

export default function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
    return () => {
      document.title = 'RareNest'
    }
  }, [title])

  useEffect(() => {
    if (!description) return

    let meta = document.querySelector('meta[name="description"]')
    const previous = meta?.getAttribute('content') || ''

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', description)

    return () => {
      if (meta) meta.setAttribute('content', previous)
    }
  }, [description])
}
