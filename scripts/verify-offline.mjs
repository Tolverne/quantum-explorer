import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const directory=resolve('dist-offline')
const files=readdirSync(directory)
const expected='quantum-explorer-offline.html'
assert.deepEqual(files,[expected],'Offline build must contain exactly one HTML file')
const html=readFileSync(resolve(directory,expected),'utf8')
assert.ok(html.length>100000,'Bundled React/Three.js code appears to be missing')
assert.match(html,/<html[^>]*>/i)
assert.match(html,/type="application\/json" id="quantum-printables"/)
assert.match(html,/<script\b[^>]*>[\s\S]+?<\/script>/i,'Expected inline JavaScript')
assert.doesNotMatch(html,/<script\b[^>]*\bsrc\s*=/i,'External scripts are not permitted')
assert.doesNotMatch(html,/<link\b[^>]*rel=["']stylesheet["'][^>]*>/i,'External CSS is not permitted')
assert.doesNotMatch(html,/<link\b[^>]*rel=["'](?:modulepreload|preload)["'][^>]*>/i,'External preload is not permitted')
assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com/i,
 'Offline file must not request remote fonts')
const match=html.match(/<script type="application\/json" id="quantum-printables">([\s\S]*?)<\/script>/)
assert.ok(match,'Printable resources not found')
const documents=JSON.parse(match[1])
for(const key of ['teacher','student']){
  assert.ok(documents[key].includes('<html'),key+' printable HTML missing')
  assert.ok(documents[key].includes('Quantum Explorer'),key+' printable document is invalid')
}
console.log('Validated standalone offline HTML ('+Math.round(html.length/1024)+' KiB), inline scripts/styles and both printable documents.')
