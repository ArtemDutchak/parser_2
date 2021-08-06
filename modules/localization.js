const locales = require.context('../src/locales', true, /[A-z0-9-_,\s]+\.json$/i)
const messages = {}
locales.keys().forEach( key => {
  const matched = key.match(/([A-z0-9-_,]+)\./i)
  if (matched && matched.length > 1) {
    const locale = matched[1]
    messages[locale] = locales(key)
  }
})

module.exports = messages
