import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Inline the two printable documents as data, not external HTML files.
// A single saved file can open them via a user-initiated print view offline.
const printables = {
  student: readFileSync(join(process.cwd(),'public/resources/student-workbook.html'),'utf8'),
  teacher: readFileSync(join(process.cwd(),'public/resources/teacher-guide.html'),'utf8')
}
const resourcePack = JSON.stringify(printables).replace(/</g,'\\u003c')

const embeddedResources: Plugin = {
  name: 'quantum-offline-printable-documents',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace('</head>',
        '<script type="application/json" id="quantum-printables">' +
        resourcePack + '</script></head>')
    }
  }
}

export default defineConfig({
  base: './',
  publicDir: false,
  define: { 'import.meta.env.VITE_OFFLINE_MODE': JSON.stringify('true') },
  plugins: [
    react(),
    embeddedResources,
    viteSingleFile({
      outputFileName: 'quantum-explorer-offline.html',
      removeViteModuleLoader: true
    })
  ],
  build: {
    outDir: 'dist-offline',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    modulePreload: false
  }
})
