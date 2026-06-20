import { useState, useEffect } from 'react'

export default function WifiLoader({ delay = 250 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <div className="spinner">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}
