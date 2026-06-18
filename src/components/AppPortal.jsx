import { createPortal } from 'react-dom'

export default function AppPortal({ children }) {
  const el = document.querySelector('.app-shell')
  if (!el) return children
  return createPortal(children, el)
}
