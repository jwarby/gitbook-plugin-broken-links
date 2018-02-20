const fs = require('fs')
const p = require('path')

const cheerio = require('cheerio')

module.exports = {
  hooks: {
    page(page) {
      const { content, path, title } = page

      const $ = cheerio.load(content)

      const userLinks = $('a')
        .not('[id]')
        .not('[href^=http]')
        .not('[href^=#]')
        .not('[href^=mailto]')
        .not('[href=]')

      const hrefs = userLinks.map((i, link) => (
        $(link).attr('href').replace(/.html(.*)*$/, '.md')
      )).get()

      const state = hrefs.map(href => {
        const r = p.normalize(
          p.resolve(
            p.dirname(path),
            decodeURIComponent(href)
          )
        )
        return {
          href: r,
          exists: fs.existsSync(r)
        }
      })

      state.forEach(({ exists, href }, i) => {
        if (!exists) {
          const $l = $(userLinks[i])

          $l.css('color', 'maroon')

          this.book.log.warn(`Link \x1b[1m"${$l.attr('href')}"\x1b[0m from page \x1b[1m${title}\x1b[0m is broken\n`)
        }
      })

      return {
        ...page,
        content: $.html()
      }
    }
  }
}
