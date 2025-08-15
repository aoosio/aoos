// lib/i18n.tsx
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'ar' | 'en'
type Dict = Record<string, string>

/** Dictionaries (flat keys, e.g. 'common.save') */
const DICT: Record<Lang, Dict> = {
  en: {
    // common
    'common.signIn': 'Sign in',
    'common.signOut': 'Sign out',
    'common.save': 'Save',
    'common.saving': 'Saving…',
    'common.saved': 'Saved.',
    'common.loading': 'Loading…',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.defaultLanguage': 'Default language',
    'common.ssiDays': 'Safe-sell interval (days)',
    'common.slaTargetDays': 'SLA target (days)',
    'common.defaultDialCode': 'Default dial code',
    'common.languageTag': 'EN',
    'common.langTag': 'EN', // alias to be safe

    // nav
    'nav.home': 'Home',
    'nav.suggestions': 'Suggestions',
    'nav.pos': 'POs',
    'nav.suppliers': 'Suppliers',
    'nav.uploads': 'Uploads',
    'nav.outbox': 'Outbox',
    'nav.templates': 'Templates',
    'nav.audit': 'Audit',
    'nav.settings': 'Settings',

    // settings
    'settings.org': 'Organization',
    'settings.connect': 'Connect & Test',
    'settings.connecting': 'Connecting…',

    // uploads
    'uploads.title': 'Uploads',
    'uploads.salesCsv': 'Sales CSV',
    'uploads.stockCsv': 'Stock CSV',
    'uploads.salesCols': 'Columns: product,sold_qty',
    'uploads.stockCols': 'Columns: product,qty,expiry_date,distributor,distributor_phone',
    'uploads.uploadSales': 'Upload sales',
    'uploads.uploadStock': 'Upload stock',

    // outbox
    'outbox.title': 'WhatsApp Outbox',
    'outbox.to': 'To (E.164)',
    'outbox.text': 'Text',
    'outbox.sendTest': 'Send test',
    'outbox.sending': 'Sending…',

    // suppliers
    'suppliers.title': 'Suppliers',
    'suppliers.name': 'Name',
    'suppliers.phone': 'Phone (WhatsApp)',
    'suppliers.lang': 'Language',
    'suppliers.add': 'Add supplier',
    'suppliers.added': 'Supplier added.',
    'suppliers.updated': 'Saved changes.',
    'suppliers.removed': 'Supplier removed.',

    // auth (login page)
    'auth.title': 'Sign in',
    'auth.email': 'Email',
    'auth.subtitle': 'Enter your email. We’ll send a magic link',
    'auth.sendLink': 'Send magic link',
    'auth.sent': 'Link sent. Check your email.',
  },

  ar: {
    // common
    'common.signIn': 'تسجيل الدخول',
    'common.signOut': 'تسجيل الخروج',
    'common.save': 'حفظ',
    'common.saving': 'جارٍ الحفظ…',
    'common.saved': 'تم الحفظ.',
    'common.loading': 'جارٍ التحميل…',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.defaultLanguage': 'اللغة الافتراضية',
    'common.ssiDays': 'فترة البيع الآمن (أيام)',
    'common.slaTargetDays': 'هدف مدة التوريد (أيام)',
    'common.defaultDialCode': 'رمز الاتصال الافتراضي',
    'common.languageTag': 'AR',
    'common.langTag': 'AR', // alias

    // nav
    'nav.home': 'الرئيسية',
    'nav.suggestions': 'الاقتراحات',
    'nav.pos': 'أوامر الشراء',
    'nav.suppliers': 'المورّدون',
    'nav.uploads': 'الرفع',
    'nav.outbox': 'صندوق واتساب',
    'nav.templates': 'القوالب',
    'nav.audit': 'السجل',
    'nav.settings': 'الإعدادات',

    // settings
    'settings.org': 'المنظمة',
    'settings.connect': 'اتصال واختبار',
    'settings.connecting': 'جارٍ الاتصال…',

    // uploads
    'uploads.title': 'الرفع',
    'uploads.salesCsv': 'ملف المبيعات CSV',
    'uploads.stockCsv': 'ملف المخزون CSV',
    'uploads.salesCols': 'الأعمدة: product,sold_qty',
    'uploads.stockCols': 'الأعمدة: product,qty,expiry_date,distributor,distributor_phone',
    'uploads.uploadSales': 'رفع المبيعات',
    'uploads.uploadStock': 'رفع المخزون',

    // outbox
    'outbox.title': 'صندوق واتساب',
    'outbox.to': 'إلى (E.164)',
    'outbox.text': 'النص',
    'outbox.sendTest': 'إرسال تجريبي',
    'outbox.sending': 'جارٍ الإرسال…',

    // suppliers
    'suppliers.title': 'المورّدون',
    'suppliers.name': 'الاسم',
    'suppliers.phone': 'الهاتف (واتساب)',
    'suppliers.lang': 'اللغة',
    'suppliers.add': 'إضافة مورّد',
    'suppliers.added': 'تمت إضافة المورّد.',
    'suppliers.updated': 'تم حفظ التعديلات.',
    'suppliers.removed': 'تم حذف المورّد.',

    // auth
    'auth.title': 'تسجيل الدخول',
    'auth.email': 'البريد الإلكتروني',
    'auth.subtitle': 'أدخل بريدك الإلكتروني لإرسال رابط الدخول',
    'auth.sendLink': 'إرسال الرابط',
    'auth.sent': 'تم الإرسال. تفقد بريدك.',
  },
}

/** Context */
type I18nCtx = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nCtx | null>(null)

function initialLang(): Lang {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('aoos_lang') as Lang | null
    if (saved === 'ar' || saved === 'en') return saved
    const docLang = document.documentElement.lang
    if (docLang === 'ar' || docLang === 'en') return docLang
  }
  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('aoos_lang', l)
  }

  // keep <html> in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const t = (key: string) => DICT[lang][key] ?? key
  const value = useMemo<I18nCtx>(
    () => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang, t }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
