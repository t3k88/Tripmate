import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const month = new Date().getMonth() + 1
const seasons = {
  spring: { months: [3,4,5], primary: '#E8739A', primaryLight: '#F0A0BC', primaryDark: '#C4506E', primaryBg: 'rgba(232,115,154,0.08)', bg: '#FFF8FB', bodyBg: '#F5E8F0' },
  summer: { months: [6,7,8], primary: '#0EA5C9', primaryLight: '#38C4E0', primaryDark: '#0880A0', primaryBg: 'rgba(14,165,201,0.08)', bg: '#F0FAFF', bodyBg: '#C8E8F5' },
  fall:   { months: [9,10,11], primary: '#D4611A', primaryLight: '#E8854A', primaryDark: '#A84A10', primaryBg: 'rgba(212,97,26,0.08)', bg: '#FFF8F0', bodyBg: '#E8D4C0' },
  winter: { months: [12,1,2], primary: '#4A6FBF', primaryLight: '#7090D8', primaryDark: '#2E4F9A', primaryBg: 'rgba(74,111,191,0.08)', bg: '#F5F8FF', bodyBg: '#C8D8EE' },
}
const theme = Object.values(seasons).find(s => s.months.includes(month)) || seasons.summer
const root = document.documentElement
root.style.setProperty('--primary', theme.primary)
root.style.setProperty('--primary-light', theme.primaryLight)
root.style.setProperty('--primary-dark', theme.primaryDark)
root.style.setProperty('--primary-bg', theme.primaryBg)
root.style.setProperty('--bg', theme.bg)
document.body.style.background = theme.bodyBg

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
