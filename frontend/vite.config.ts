import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function figmaPackageVersionResolver() {
  return {
    name: 'figma-package-version-resolver',
    resolveId(source: string, importer: string | undefined, options: any) {
      const match = source.match(/^((?:@[^/]+\/)?[^@/]+)@[0-9]/);
      if (match) {
        return this.resolve(match[1], importer, { skipSelf: true, ...options });
      }
      return null;
    },
  }
}

export default defineConfig({
  plugins: [
    figmaPackageVersionResolver(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
