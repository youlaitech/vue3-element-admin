import {createI18n} from 'vue-i18n'
import {localStorage} from '@/utils/storage'

// Element Plus 国际化配置
import elementPlusLocaleZhCn from 'element-plus/es/locale/lang/zh-cn'
import elementPlusLocaleEn from 'element-plus/es/locale/lang/en'

// 自定义国际化配置
import enLocale from './en'
import zhCnLocale from './zh-cn'
import {Locale, Path} from "@intlify/core-base";

const messages = {
    'zh-cn': {
        ...zhCnLocale,
        ...elementPlusLocaleZhCn
    },
    en: {
        ...enLocale,
        ...elementPlusLocaleEn
    }
}

export const getLanguage = () => {
    let language = localStorage.get('language')
    if (language) {
        return language
    }
    language = navigator.language.toLowerCase() // 浏览器使用的语言
    const locales = Object.keys(messages)
    for (const locale of locales) {
        if (language.indexOf(locale) > -1) {
            return locale
        }
    }
    return 'zh-cn'
}

const i18n = createI18n({
    locale: getLanguage(),
    messages: messages
})

export default i18n