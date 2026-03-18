// Type declarations for vanilla-colorful hex-color-picker
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    'hex-color-picker': {
      color?: string
      'onColor-changed'?: (event: CustomEvent<{ detail: { value: string } }>) => void
    }
  }
}

export {}