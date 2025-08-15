// lib/i18n.tsx
'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'ar' | 'en'
type Dict = Record<string, string>

const DICT: Record<Lang, Dict> = {
  en: {
    // common
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
  },
  ar: {
    // common
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
  },
}

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nCtx = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aoos_lang') as Lang | null
      if (saved === 'ar' || saved === 'en') return saved
    }
    return 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('aoos_lang', l)
  }

  // Apply <html> attributes whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const t = (key: string) => DICT[lang][key] ?? key
  const value = useMemo(() => ({ lang, setLang, t }), [lang])

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
