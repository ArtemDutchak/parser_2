
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);

function loadLocalMessages(){
  const locales = require.context('./locales', true, /[A-Za-z0-9]+\.json$/i)
  const messages = {}
  locales.keys().forEach( key => {
    const matched = key.match(/([A-Za-z0-9-_\s]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)

    }
  })
  return messages
}

// const defaultImpl = VueI18n.prototype.getChoiceIndex

/**
 * @param choice {number} a choice index given by the input to $tc: `$tc('path.to.rule', choiceIndex)`
 * @param choicesLength {number} an overall amount of available choices
 * @returns a final choice index to select plural word by
**/
VueI18n.prototype.getChoiceIndex = function (choice, choicesLength) {
  // this === VueI18n instance, so the locale property also exists here
  if (this.locale !== 'ru' && this.locale !== 'ua') {
    // proceed to the default implementation
    // return defaultImpl.apply(this, arguments)
  }

  if (choice === 0) {
    return 0;
  }

  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;

  if (!teen && endsWithOne) {
    return 1;
  }

  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
    return 2;
  }

  return (choicesLength < 4) ? 2 : 3;
}

export const i18n = new VueI18n({
  locale: 'en',
  fallbacklocales: 'en',
  messages: loadLocalMessages(),
  silentTranslationWarn: true
})
