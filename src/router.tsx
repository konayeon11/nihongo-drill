import { useCallback, useEffect, useState, type ReactNode } from 'react'

/**
 * 해시 기반 초소형 라우터.
 * GitHub Pages처럼 서버 리라이트를 설정할 수 없는 정적 호스팅에서도
 * 새로고침·딥링크가 깨지지 않는다.
 */

function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : '/'
}

export function navigate(to: string, replace = false) {
  const hash = `#${to}`
  if (replace) window.history.replaceState(null, '', hash)
  else window.location.hash = to
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    if (!window.location.hash) navigate('/', true)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const [pathname, search = ''] = path.split('?')
  const segments = pathname.split('/').filter(Boolean)
  const query = new URLSearchParams(search)
  return { path, pathname, segments, query }
}

interface LinkProps {
  to: string
  className?: string
  children: ReactNode
  onClick?: () => void
}

export function Link({ to, className, children, onClick }: LinkProps) {
  const handle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick?.()
      navigate(to)
    },
    [to, onClick],
  )
  return (
    <a href={`#${to}`} className={className} onClick={handle}>
      {children}
    </a>
  )
}
