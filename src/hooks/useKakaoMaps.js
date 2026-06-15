import { useEffect, useState } from 'react'

let loadState = 'idle' // idle | loading | ready | error
const listeners = new Set()

function notify() {
  listeners.forEach(fn => fn(loadState))
}

function initKakao() {
  if (loadState !== 'idle') return
  loadState = 'loading'

  const tryLoad = () => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => {
        loadState = 'ready'
        notify()
      })
    } else {
      loadState = 'error'
      notify()
    }
  }

  // 페이지가 이미 로드됐으면 바로, 아니면 load 이벤트 후 실행
  if (document.readyState === 'complete') {
    tryLoad()
  } else {
    window.addEventListener('load', tryLoad, { once: true })
  }
}

export function useKakaoMaps() {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    const update = (s) => setState(s)
    listeners.add(update)

    initKakao()

    return () => listeners.delete(update)
  }, [])

  return {
    ready: state === 'ready',
    loading: state === 'loading',
    error: state === 'error',
  }
}
