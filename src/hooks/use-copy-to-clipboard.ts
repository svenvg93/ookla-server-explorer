import { useState, useRef, useEffect, useCallback } from 'react'

export function useCopyToClipboard(timeout = 1500) {
  const [copied, setCopied] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setCopied(text)
      timerRef.current = setTimeout(() => setCopied(null), timeout)
    }).catch(() => {})
  }, [timeout])

  return { copied, copy }
}
