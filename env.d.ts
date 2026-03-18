/// <reference types="vite/client" />

// Declare custom HTML elements for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hex-color-picker': {
        color?: string
        'onColor-changed'?: (event: CustomEvent<{ detail: { value: string } }>) => void
      }
    }
  }
}

export {}