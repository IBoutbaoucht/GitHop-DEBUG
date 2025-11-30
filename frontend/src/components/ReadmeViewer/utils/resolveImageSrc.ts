// src/components/ReadmeViewer/utils/resolveImageSrc.ts
export function resolveImageSrc(
  src?: string,
  repoFullName?: string,
  defaultBranch = 'main',
  readmePath?: string
) {
  if (!src) return ''
  src = src.trim()

  // protocol-relative
  if (src.startsWith('//')) return 'https:' + src

  // absolute URLs or data:
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src

  // github blob -> convert to raw
  const githubBlobMatch = src.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/i)
  if (githubBlobMatch) {
    const [, ownerRepo, branch, path] = githubBlobMatch
    return `https://raw.githubusercontent.com/${ownerRepo}/${branch}/${path}`
  }

  // already raw or user-images
  if (/^https?:\/\/raw\.githubusercontent\.com\//i.test(src)) return src
  if (/^https?:\/\/user-images\.githubusercontent\.com\//i.test(src)) return src

  // repo-root absolute path -> raw url
  if (src.startsWith('/')) {
    if (!repoFullName) return src
    return `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/${src.replace(/^\/+/, '')}`
  }

  // relative path -> resolve against README path or repo root
  if (repoFullName) {
    let baseDir = ''
    if (readmePath) {
      const idx = readmePath.lastIndexOf('/')
      baseDir = idx >= 0 ? readmePath.slice(0, idx + 1) : ''
    }

    const normalize = (base: string, rel: string) => {
      const baseParts = base.split('/').filter(Boolean)
      const relParts = rel.split('/').filter(Boolean)
      for (const part of relParts) {
        if (part === '.') continue
        if (part === '..') baseParts.pop()
        else baseParts.push(part)
      }
      return baseParts.join('/')
    }

    const target = normalize(baseDir, src)
    return `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/${target}`
  }

  // fallback
  return src
}
