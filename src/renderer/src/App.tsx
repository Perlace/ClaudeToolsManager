import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { useToolStore } from './store/toolStore'

export function App() {
  const { detectClaude, loadEnabledTools, loadCustomTools, loadCategoryData, loadProfiles, autoDetectProfile, theme } = useToolStore()

  useEffect(() => {
    const init = async () => {
      await loadProfiles()
      await detectClaude()
      await loadEnabledTools()
      await loadCustomTools()
      await loadCategoryData()
      await autoDetectProfile()
    }
    init()

    // Auto-detect profile toutes les 10s
    const interval = setInterval(() => autoDetectProfile(), 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  return <Layout />
}
