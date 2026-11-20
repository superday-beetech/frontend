import type { Editor } from '@tiptap/core'
import type { EditorFeature, EditorToolbarItem } from './editor.types'

export const EDITOR_TOOLBAR: EditorToolbarItem[] = [
  {
    name: 'bold',
    label: 'Bold',
    feature: 'bold',
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    name: 'italic',
    label: 'Italic',
    feature: 'italic',
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    name: 'underline',
    label: 'Underline',
    feature: 'underline',
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
  },
  {
    name: 'strike',
    label: 'Strike',
    feature: 'strike',
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
  },

  ...([1, 2, 3] as const).map((level) => ({
    name: `heading-${level}`,
    label: `H${level}`,
    feature: 'heading' as const,
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level }).run(),
    isActive: (editor: Editor) => editor.isActive('heading', { level }),
  })),

  {
    name: 'bulletList',
    label: 'Bullet list',
    feature: 'bulletList',
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    name: 'orderedList',
    label: 'Numbered list',
    feature: 'orderedList',
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    name: 'blockquote',
    label: 'Quote',
    feature: 'blockquote',
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    name: 'link',
    label: 'Link',
    feature: 'link',
    action: (editor) => {
      const currentUrl = editor.getAttributes('link').href ?? ''
      const url = window.prompt('Masukkan URL', currentUrl)

      if (url === null) return

      if (!url.trim()) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    },
    isActive: (editor) => editor.isActive('link'),
  },
  {
    name: 'code',
    label: 'Inline code',
    feature: 'code',
    action: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive('code'),
  },
  {
    name: 'codeBlock',
    label: 'Code block',
    feature: 'codeBlock',
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive('codeBlock'),
  },
  {
    name: 'horizontalRule',
    label: 'Horizontal rule',
    feature: 'horizontalRule',
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    name: 'undo',
    label: 'Undo',
    feature: 'undoRedo',
    action: (editor) => editor.chain().focus().undo().run(),
    isDisabled: (editor) => !editor.can().undo(),
  },
  {
    name: 'redo',
    label: 'Redo',
    feature: 'undoRedo',
    action: (editor) => editor.chain().focus().redo().run(),
    isDisabled: (editor) => !editor.can().redo(),
  },
]

export function getEditorToolbar(features: readonly EditorFeature[]): EditorToolbarItem[] {
  return EDITOR_TOOLBAR.filter((item) => features.includes(item.feature))
}
