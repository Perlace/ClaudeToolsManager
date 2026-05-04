import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { useToolStore } from './store/toolStore'

export function App() {
  const { detectClaude, loadEnabledTools, loadCustomTools, theme } = useToolStore()

  useEffect(() => {
    const init = async () => {
      await detectClaude()
      await loadEnabledTools()
      await loadCustomTools()
    }
    init()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  return <Layout />
}
