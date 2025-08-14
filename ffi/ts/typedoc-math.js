(function () {
  const addCss = (href) => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    document.head.appendChild(l)
  }
  const addJs  = (src, onload) => {
    const s = document.createElement('script')
    s.src = src
    s.defer = true
    s.onload = onload
    document.head.appendChild(s)
  }

  addCss('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css')
  addJs('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', () => {
    addJs('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js', () => {
      const render = () => {
        if (!window.renderMathInElement) return
        const root = document.querySelector('main') || document.body
        window.renderMathInElement(root, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$',  right: '$',  display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        })
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render)
      } else {
        render()
      }

      const target = document.querySelector('main') || document.body
      const mo = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type === 'childList') { render(); break }
        }
      })
      mo.observe(target, { childList: true, subtree: true })

      window.addEventListener('hashchange', render)
      window.addEventListener('popstate', render)
    })
  })

  // force external links to open in new tab
  const fixLinks = () => {
    document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach(a => {
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixLinks)
  } else {
    fixLinks()
  }
})()

