import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const source=resolve('dist-offline/quantum-explorer-offline.html')
const target=resolve('dist/downloads/quantum-explorer-offline.html')
mkdirSync(resolve('dist/downloads'),{recursive:true})
copyFileSync(source,target)
console.log('Bundled offline edition is available at dist/downloads/quantum-explorer-offline.html')
