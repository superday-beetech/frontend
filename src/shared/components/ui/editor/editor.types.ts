import type { Editor } from '@tiptap/core'

export type EditorFeature =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'code'
  | 'codeBlock'
  | 'horizontalRule'
  | 'undoRedo'

export const DEFAULT_EDITOR_FEATURES: EditorFeature[] = ['bold', 'italic', 'underline', 'heading', 'bulletList', 'orderedList', 'undoRedo']

export interface EditorToolbarItem {
  name: string
  label: string
  feature: EditorFeature
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  isDisabled?: (editor: Editor) => boolean
}
