const fs = require('mz/fs')
const globby = require('globby')
const matter = require('gray-matter')

function rTime(date) {
  // new Date(undefined).toJSON() returns null
  const json_date = new Date(date || null).toJSON()
  return json_date.split('T')[0]
}

var compareDate = function (obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

module.exports = async () => {
  const paths = await globby(['**.md', '!**/README.md'], {
    ignore: ['node_modules'],
  })
  let pages = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, 'utf-8')
      const { data } = matter(content)
      data.date = rTime(data.date)
      return {
        frontMatter: data,
        regularPath: `${item.replace('.md', '.html').slice(4)}`,
        relativePath: item,
      }
    })
  )
  pages = pages.filter((item) => !item.frontMatter.page)

  pages.sort(compareDate)
  return pages
}
