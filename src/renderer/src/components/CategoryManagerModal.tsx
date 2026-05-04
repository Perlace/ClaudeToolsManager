import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderCog, ChevronUp, ChevronDown, Trash2, Lock, Plus, Check } from 'lucide-react'
import { useToolStore } from '../store/toolStore'
import { CATEGORIES } from '../data/tools'
import type { Category } from '../types'

const EMOJI_PICKER = ['⚡','🎨','🔍','🔒','📈','📱','🧠','💰','🌟','🚀','🛠️','🎯','💡','🔧','⭐','🏆','🎪','🌈','🦋','🔮','💫','✨','🎉','🎁','🎓','🔬','🎭','🎸','🎹','🎺']

const COLOR_PRESETS = [
  '#ff6b35','#f59e0b','#22c55e','#06b6d4','#7c3aed',
  '#ef4444','#8b5cf6','#f97316','#0ea5e9','#ec4899',
]

interface Props {
  open: boolean
  onClose: () => void
}

export function CategoryManagerModal({ open, onClose }: Props) {
  const {
    getAllCategories,
    updateCategoryCustom,
    deleteUserCategory,
    saveCategoryOrder,
    addUserCategory,
    userCategories,
  } = useToolStore()

  const allCategories = getAllCategories()
  const builtInIds = new Set(CATEGORIES.map((c) => c.id))

  // New category form
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('🎯')
  const [newColor, setNewColor] = useState('#ff6b35')
  const newNameRef = useRef<HTMLInputElement>(null)

  // Inline pickers state
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null)

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const ids = allCategories.map((c) => c.id)
    const tmp = ids[index - 1]
    ids[index - 1] = ids[index]
    ids[index] = tmp
    saveCategoryOrder(ids)
  }

  const handleMoveDown = (index: number) => {
    if (index === allCategories.length - 1) return
    const ids = allCategories.map((c) => c.id)
    const tmp = ids[index + 1]
    ids[index + 1] = ids[index]
    ids[index] = tmp
    saveCategoryOrder(ids)
  }

  const handleNameChange = (cat: Category, value: string) => {
    updateCategoryCustom(cat.id, { name: value })
  }

  const handleEmojiChange = (catId: string, emoji: string) => {
    updateCategoryCustom(catId, { icon: emoji })
    setEmojiPickerFor(null)
  }

  const handleColorChange = (catId: string, color: string) => {
    updateCategoryCustom(catId, { color })
    setColorPickerFor(null)
  }

  const handleAddCategory = async () => {
    if (!newName.trim()) return
    await addUserCategory({
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      gradient: `from-[${newColor}] to-[${newColor}]`,
      description: '',
    })
    setNewName('')
    setNewIcon('🎯')
    setNewColor('#ff6b35')
    setShowNewForm(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-4 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-card-hover overflow-hidden"
            style={{ maxWidth: 640, maxHeight: 680, margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <FolderCog size={16} className="text-accent" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text">Gérer les catégories</div>
                <div className="text-xs text-text-muted">Renommer, réordonner, créer ou supprimer des catégories</div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-card-hover hover:text-text transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollable p-4 space-y-2">
              {allCategories.map((cat, index) => {
                const isUserCat = !builtInIds.has(cat.id)
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-xl"
                  >
                    {/* Emoji picker button */}
                    <div className="relative">
                      <button
                        onClick={() => setEmojiPickerFor(emojiPickerFor === cat.id ? null : cat.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-card-hover transition-all"
                        title="Changer l'icône"
                      >
                        {cat.icon}
                      </button>
                      {emojiPickerFor === cat.id && (
                        <div className="absolute top-10 left-0 z-50 bg-card border border-border rounded-xl p-2 shadow-card-hover grid grid-cols-6 gap-1 w-48">
                          {EMOJI_PICKER.map((em) => (
                            <button
                              key={em}
                              onClick={() => handleEmojiChange(cat.id, em)}
                              className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-accent-dim transition-all"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Name input */}
                    <input
                      type="text"
                      defaultValue={cat.name}
                      onBlur={(e) => handleNameChange(cat, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                      className="flex-1 text-xs font-medium text-text bg-transparent border-none outline-none min-w-0"
                    />

                    {/* Color swatch */}
                    <div className="relative">
                      <button
                        onClick={() => setColorPickerFor(colorPickerFor === cat.id ? null : cat.id)}
                        className="w-5 h-5 rounded-full border-2 border-border hover:border-text-muted transition-all shrink-0"
                        style={{ background: cat.color }}
                        title="Changer la couleur"
                      />
                      {colorPickerFor === cat.id && (
                        <div className="absolute top-8 right-0 z-50 bg-card border border-border rounded-xl p-3 shadow-card-hover w-48">
                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {COLOR_PRESETS.map((c) => (
                              <button
                                key={c}
                                onClick={() => handleColorChange(cat.id, c)}
                                className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                                style={{
                                  background: c,
                                  borderColor: cat.color === c ? '#fff' : 'transparent',
                                }}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => handleColorChange(cat.id, e.target.value)}
                            className="w-full h-7 rounded cursor-pointer border border-border"
                          />
                        </div>
                      )}
                    </div>

                    {/* Move up / down */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-card-hover transition-all disabled:opacity-30"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === allCategories.length - 1}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-card-hover transition-all disabled:opacity-30"
                    >
                      <ChevronDown size={13} />
                    </button>

                    {/* Delete / lock */}
                    {isUserCat ? (
                      <button
                        onClick={() => deleteUserCategory(cat.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Supprimer cette catégorie"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-text-dim"
                        title="Catégorie intégrée — non supprimable"
                      >
                        <Lock size={12} />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* New category form */}
              {showNewForm && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-accent/30 rounded-xl">
                  {/* Icon picker */}
                  <div className="relative">
                    <button
                      onClick={() => setEmojiPickerFor(emojiPickerFor === '__new' ? null : '__new')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-card-hover transition-all"
                    >
                      {newIcon}
                    </button>
                    {emojiPickerFor === '__new' && (
                      <div className="absolute top-10 left-0 z-50 bg-card border border-border rounded-xl p-2 shadow-card-hover grid grid-cols-6 gap-1 w-48">
                        {EMOJI_PICKER.map((em) => (
                          <button
                            key={em}
                            onClick={() => { setNewIcon(em); setEmojiPickerFor(null) }}
                            className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-accent-dim transition-all"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    ref={newNameRef}
                    type="text"
                    placeholder="Nom de la catégorie..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory() }}
                    autoFocus
                    className="flex-1 text-xs font-medium text-text bg-transparent border-none outline-none min-w-0 placeholder:text-text-dim"
                  />

                  {/* Color */}
                  <div className="relative">
                    <button
                      onClick={() => setColorPickerFor(colorPickerFor === '__new' ? null : '__new')}
                      className="w-5 h-5 rounded-full border-2 border-border hover:border-text-muted transition-all shrink-0"
                      style={{ background: newColor }}
                    />
                    {colorPickerFor === '__new' && (
                      <div className="absolute top-8 right-0 z-50 bg-card border border-border rounded-xl p-3 shadow-card-hover w-48">
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c}
                              onClick={() => { setNewColor(c); setColorPickerFor(null) }}
                              className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                              style={{
                                background: c,
                                borderColor: newColor === c ? '#fff' : 'transparent',
                              }}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="w-full h-7 rounded cursor-pointer border border-border"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddCategory}
                    disabled={!newName.trim()}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-green-400 hover:text-green-500 hover:bg-green-500/10 transition-all disabled:opacity-30"
                    title="Confirmer"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => { setShowNewForm(false); setNewName(''); setEmojiPickerFor(null); setColorPickerFor(null) }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-card-hover transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <button
                onClick={() => { setShowNewForm(true); setTimeout(() => newNameRef.current?.focus(), 50) }}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <Plus size={14} />
                Nouvelle catégorie
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
