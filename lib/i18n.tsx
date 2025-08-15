'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

type Lang = 'ar' | 'en'
type Ctx = { lang: Lang; t: (key: string) => string; setLang: (l: Lang) => void }

const dict = {
  en: {
    appName: 'AOOS',
    nav: { dashboard: 'Dashboard', suppliers: 'Suppliers', uploads: 'Uploads', settings: 'Settings', outbox: 'Outbox', templates: 'Templates', audit: 'Audit', suggestions: 'Suggestions', pos: 'POs' },
    common: { save: 'Save', saving: 'Saving…', saved: 'Saved.', added: 'Added.', language: 'Language', defaultLanguage: 'Default language', defaultDialCode: 'Default dial code', ssiDays: 'Safe-sell interval (days)', slaTargetDays: 'SLA target (days)' },
    suppliers: { title: 'Suppliers', name: 'Name', phone: 'Phone (WhatsApp)', addSupplier: 'Add supplier' },
    uploads: { title: 'Uploads', salesCsv: 'Sales CSV', stockCsv: 'Stock CSV', uploadSales: 'Upload sales', uploadStock: 'Upload stock', salesCols: 'Columns: product,sold_qty', stockCols: 'Columns: product,qty,expiry_date,distributor,distributor_phone' },
    outbox: { title: 'WhatsApp Outbox', to: 'To (E.164)', text: 'Text', sendTest: 'Send test', sending: 'Sending…' },
    settings: { org: 'Organization', connect: 'Connect & Test', connecting: 'Connecting…' }
  },
  ar: {
    appName: 'أَوُوس',
    nav: { dashboard: 'الرئيسية', suppliers: 'المورّدون', uploads: 'الرفع', settings: 'الإعدادات', outbox: 'صندوق الإرسال', templates: 'القوالب', audit: 'السجل', suggestions: 'الاقتراحات', pos: 'طلبات الشراء' },
    common: { save: 'حفظ', saving: 'جارٍ الحفظ…', saved: 'تم الحفظ.', added: 'تمت الإضافة.', language: 'اللغة', defaultLanguage: 'اللغة الافتراضية', defaultDialCode: 'رمز الاتصال الافتراضي', ssiDays: 'فترة البيع الآمن (أيام)', slaTargetDays: 'هدف مدة التوريد (أيام)' },
    suppliers: { title: 'المورّدون', name: 'الاسم', phone: 'الهاتف (واتساب)', addSupplier: 'إضافة مورّد' },
    uploads: { title: 'الرفع', salesCsv: 'ملف المبيعات CSV', stockCsv: 'ملف المخزون CSV', uploadSales: 'رفع المبيعات', uploadStock: 'رفع المخزون', salesCols: 'الأعمدة: product,sold_qty', stockCols: 'الأعمدة: product,qty,expiry_date,distributor,distributor_phone' },
    outbox: { title: 'صندوق واتساب', to: 'إلى (E.164)', text: 'النص', sendTest: 'إرسال تجريبي', sending: 'جارٍ الإرسال…' },
    settings: { org: 'المنظمة', connect: 'اتصال واختبار', connecting: 'جارٍ الاتصال…' }
  }
} as const

const I18nContext = createContext<Ctx>({ lang: 'ar', t: (k) => k, setLang: () => {} })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar')

  // bootstrap from localStorage or org default
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('aoos_lang')) as Lang | null
    if (saved) {
      setLang(saved)
    } else {
      supabase.from('organizations').select('default_language').limit(1).then(({ data }) => {
        setLang((data?.[0]?.default_language as Lang) || 'ar')
      })
    }
  }, [])

  // apply html dir/lang + persist
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
    if (typeof localStorage !== 'undefined') localStorage.setItem('aoos_lang', lang)
  }, [lang])

  const t = useCallback((key: string) => {
    const parts = key.split('.')
    let node: any = dict[lang]
    for (const p of parts) node = node?.[p]
    return typeof node === 'string' ? node : key
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
