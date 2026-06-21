import { createPortal } from 'react-dom'

export default function AppPortal({ children }) {
  const el = document.querySelector('.app-shell') || document.body
  return createPortal(children, el)
}
