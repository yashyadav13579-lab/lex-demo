import fs from 'node:fs'
import path from 'node:path'

const APP_DIR = path.join(process.cwd(), 'app')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const SKIP_FILES = new Set(['layout.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx', 'route.ts'])

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath))
      continue
    }
    files.push(fullPath)
  }

  return files
}

function toRoute(pageFilePath) {
  const relative = path.relative(APP_DIR, pageFilePath).replaceAll(path.sep, '/')
  const routeDir = relative
    .replace(/\/page\.(t|j)sx?$/, '')
    .split('/')
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
    .join('/')
  if (routeDir === '') return '/'
  return `/${routeDir}`
}

function normalizePath(inputPath) {
  if (!inputPath.startsWith('/')) return null
  if (inputPath.startsWith('/api')) return null
  return inputPath.replace(/\/+$/, '') || '/'
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toRouteRegex(routePattern) {
  if (!routePattern.includes('[')) {
    return new RegExp(`^${escapeRegex(routePattern)}$`)
  }

  const segments = routePattern.split('/').map((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) return '[^/]+'
    return escapeRegex(segment)
  })
  return new RegExp(`^${segments.join('/')}$`)
}

const allFiles = walk(APP_DIR)
const pageFiles = allFiles.filter((file) => {
  const base = path.basename(file)
  return base === 'page.tsx' || base === 'page.ts' || base === 'page.jsx' || base === 'page.js'
})

const routePatterns = pageFiles.map(toRoute)
const routeRegexes = routePatterns.map(toRouteRegex)
const sourceFiles = allFiles.filter((file) => SOURCE_EXTENSIONS.has(path.extname(file)))

const pattern = /(?:href|push|redirect)\(\s*['"`]([^'"`]+)['"`]\s*\)|href\s*=\s*['"`]([^'"`]+)['"`]/g
const failures = []

for (const file of sourceFiles) {
  if (SKIP_FILES.has(path.basename(file)) && !file.endsWith('/page.tsx')) continue

  const content = fs.readFileSync(file, 'utf8')
  let match
  while ((match = pattern.exec(content)) !== null) {
    const rawPath = match[1] || match[2]
    if (!rawPath) continue
    if (rawPath.includes('${')) continue
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) continue

    const candidate = normalizePath(rawPath)
    if (!candidate) continue

    const hasMatch = routeRegexes.some((regex) => regex.test(candidate))
    if (!hasMatch) {
      failures.push({
        file: path.relative(process.cwd(), file),
        route: candidate
      })
    }
  }
}

if (failures.length > 0) {
  console.error('Missing route targets found:')
  for (const failure of failures) {
    console.error(`- ${failure.route} (referenced in ${failure.file})`)
  }
  process.exit(1)
}

console.log(`Internal route check passed for ${sourceFiles.length} files.`)
