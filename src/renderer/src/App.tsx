import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { useToolStore } from './store/toolStore'

export function App() {
  const { detectClaude, loadEnabledTools, loadCustomTools, loadCategoryData, loadProfiles, autoDetectProfile, switchProfile, theme } = useToolStore()

  useEffect(() => {
    const init = async () => {
      await loadProfiles()

      // Fenêtre dédiée à un profil (lancée via "Ouvrir dans nouvelle fenêtre")
      const hashMatch = window.location.hash.match(/#profile=([^&]+)/)
      if (hashMatch) {
        const forcedId = decodeURIComponent(hashMatch[1])
        await switchProfile(forcedId, false)
      }

      await detectClaude()
      await loadEnabledTools()
      await loadCustomTools()
      await loadCategoryData()

      // Auto-detect seulement si fenêtre principale (pas de hash profil)
      if (!hashMatch) await autoDetectProfile()
    }
    init()

    const interval = !window.location.hash.includes('#profile=')
      ? setInterval(() => autoDetectProfile(), 10000)
      : null
    return () => { if (interval) clearInterval(interval) }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  return <Layout />
}
