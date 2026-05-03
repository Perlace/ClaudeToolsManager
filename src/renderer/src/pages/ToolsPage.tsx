import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useToolStore } from '../store/toolStore'
import { ToolCard } from '../components/tools/ToolCard'
import { ToolModal } from '../components/tools/ToolModal'
import { CATEGORIES } from '../data/tools'
import type { Tool } from '../types'

export function ToolsPage() {
  const { activeCategory, searchQuery, tools } = useToolStore()
  const getFilteredTools = useToolStore((s) => s.getFilteredTools)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  const filteredTools = useMemo(
    () => getFilteredTools(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tools, activeCategory, searchQuery]
  )
  const category = CATEGORIES.find((c) => c.id === activeCategory)

  const groupedByCategory = useMemo(() => {
    if (activeCategory !== 'all') return null
    const groups: Record<string, Tool[]> = {}
    for (const tool of filteredTools) {
      if (!groups[tool.category]) groups[tool.category] = []
      groups[tool.category].push(tool)
    }
    return groups
  }, [filteredTools, activeCategory])

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollable p-6">
        {/* Category header */}
        {category && (
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${category.color}20`, border: `1px solid ${category.color}40` }}
            >
              {category.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">{category.name}</h2>
              <p className="text-sm text-text-secondary">{category.description}</p>
            </div>
          </div>
        )}

        {activeCategory === 'all' && !searchQuery && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text">Tous les outils</h2>
            <p className="text-sm text-text-secondary mt-1">{filteredTools.length} outils disponibles</p>
          </div>
        )}

        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text">
              Résultats pour{' '}
              <span className="text-accent">"{searchQuery}"</span>
            </h2>
            <p className="text-sm text-text-secondary mt-1">{filteredTools.length} outil(s) trouvé(s)</p>
          </div>
        )}

        {/* Tools grid - grouped by category when "all" */}
        {groupedByCategory ? (
          <div className="space-y-8">
            {CATEGORIES.filter((c) => groupedByCategory[c.id]?.length > 0).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">{cat.icon}</span>
                  <h3 className="text-sm font-semibold text-text">{cat.name}</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-text-muted">{groupedByCategory[cat.id].length} outils</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {groupedByCategory[cat.id].map((tool, i) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onDetail={setSelectedTool}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTools.map((tool, i) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onDetail={setSelectedTool}
                index={i}
              />
            ))}
          </div>
        )}

        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-text mb-2">Aucun outil trouvé</h3>
            <p className="text-sm text-text-secondary">
              Essayez un autre terme de recherche ou importez un outil personnalisé.
            </p>
          </motion.div>
        )}
      </div>

      <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </>
  )
}
