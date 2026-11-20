import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { EditorFeature } from './editor.types'

export function createEditorExtensions(features: readonly EditorFeature[], placeholder: string) {
  const has = (feature: EditorFeature) => features.includes(feature)

  const hasLists = has('bulletList') || has('orderedList')

  return [
    StarterKit.configure({
      bold: has('bold') ? {} : false,
      italic: has('italic') ? {} : false,
      underline: has('underline') ? {} : false,
      strike: has('strike') ? {} : false,

      heading: has('heading') ? { levels: [1, 2, 3] } : false,

      bulletList: has('bulletList') ? {} : false,
      orderedList: has('orderedList') ? {} : false,
      listItem: hasLists ? {} : false,
      listKeymap: hasLists ? {} : false,

      blockquote: has('blockquote') ? {} : false,

      link: has('link')
        ? {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer nofollow',
            },
          }
        : false,

      code: has('code') ? {} : false,
      codeBlock: has('codeBlock') ? {} : false,

      horizontalRule: has('horizontalRule') ? {} : false,

      undoRedo: has('undoRedo') ? {} : false,
    }),

    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
  ]
}
