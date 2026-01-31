'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useCallback, useEffect } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link2,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
}

function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

export function getWordCount(html: string): number {
  const text = stripHtml(html || '')
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

export function getHeadingStructure(html: string): { h1: number; h2: number; h3: number } {
  const str = html || ''
  return {
    h1: (str.match(/<h1[\s>]/gi) || []).length,
    h2: (str.match(/<h2[\s>]/gi) || []).length,
    h3: (str.match(/<h3[\s>]/gi) || []).length
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo completo da notícia ou artigo...',
  minHeight = '200px',
  disabled = false
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-purple-600 underline hover:text-purple-700' }
      })
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    isActive,
    title,
    children
  }: {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Título 1 (H1)"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Título 2 (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Título 3 (H3)"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Inserir link">
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="px-4 py-3 prose prose-sm max-w-none focus:outline-none [&_.tiptap]:min-h-[180px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
