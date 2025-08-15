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
    'common.signIn': 'Sign in',
    'common.signOut': 'Sign out',
    'common.ready': 'Ready',

    // nav
    'nav.home': 'Home',
    'nav.suggestions': 'Suggestions',
    'nav.pos': 'Purchase Orders',
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

    // POS (Purchase Orders)
    'pos.title': 'Purchase Orders',
    'pos.new': 'New PO',
    'pos.poNumber': 'PO #',
    'pos.status': 'Status',
    'pos.promised': 'Promised',
    'pos.delivered': 'Delivered',
    'pos.created': 'Created',
    'pos.count': '# PO',

    // Suggestions
    'suggestions.title': 'Suggestions',
    'suggestions.create': 'Create PO',
    'suggestions.created': 'Created',
    'suggestions.status': 'Status',
    'suggestions.recQty': 'Rec. Qty',
    'suggestions.reason': 'Reason',
    'suggestions.type': 'Type',
    'suggestions.act': 'Act',

    // Audit
    'audit.title': 'Audit Log',
    'audit.meta': 'Meta',
    'audit.entity': 'Entity',
    'audit.action': 'Action',
    'audit.actor': 'Actor',
    'audit.time': 'Time',

    // Home dashboard
    'home.openInquiries': 'Open inquiries',
    'home.goToInquiries': 'Go to inquiries',
    'home.failedWhatsApp': 'Failed WhatsApp sends (last 30d)',
    'home.seeOutbox': 'See outbox',
    'home.pendingSuggestions': 'Pending suggestions',
    'home.reviewNow': 'Review now',
    'home.openSuggestions': 'Open suggestions',
    'home.nextActions': 'Next actions',
    'home.bulkPrice.title': 'Bulk Price',
    'home.bulkPrice.desc': 'Ask for tier price where it makes sense',
    'home.refillWeeks.title': 'Refill Weeks',
    'home.refillWeeks.desc': 'Create POs for low-cover SKUs',
    'home.expiryGuard.title': 'Expiry Guard',
    'home.expiryGuard.desc': 'Resolve expiries before refills',
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
    'common.signIn': 'تسجيل الدخول',
    'common.signOut': 'تسجيل الخروج',
    'common.ready': 'جاهز',

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
    'settings.org': 'المنظّمة',
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

    // POS
    'pos.title': 'أوامر الشراء',
    'pos.new': 'أمر شراء جديد',
    'pos.poNumber': 'رقم الأمر',
    'pos.status': 'الحالة',
    'pos.promised': 'الموعود',
    'pos.delivered': 'المُسلَّم',
    'pos.created': 'أُنشئ',
    'pos.count': 'عدد الأوامر',

    // Suggestions
    'suggestions.title': 'الاقتراحات',
    'suggestions.create': 'إنشاء أمر شراء',
    'suggestions.created': 'أُنشئ',
    'suggestions.status': 'الحالة',
    'suggestions.recQty': 'الكمية المقترَحة',
    'suggestions.reason': 'السبب',
    'suggestions.type': 'النوع',
    'suggestions.act': 'تنفيذ',

    // Audit
    'audit.title': 'سجل التدقيق',
    'audit.meta': 'البيانات',
    'audit.entity': 'الكيان',
    'audit.action': 'الإجراء',
    'audit.actor': 'الفاعل',
    'audit.time': 'الوقت',

    // Home dashboard
    'home.openInquiries': 'الاستفسارات المفتوحة',
    'home.goToInquiries': 'اذهب إلى الاستفسارات',
    'home.failedWhatsApp': 'محاولات واتساب الفاشلة (آخر 30 يومًا)',
    'home.seeOutbox': 'اذهب إلى الصندوق',
    'home.pendingSuggestions': 'الاقتراحات المعلّقة',
    'home.reviewNow': 'راجع الآن',
    'home.openSuggestions': 'الاقتراحات المفتوحة',
    'home.nextActions': 'الخطوات التالية',
    'home.bulkPrice.title': 'سعر الجملة',
    'home.bulkPrice.desc': 'اطلب سعر الشرائح عند الحاجة',
    'home.refillWeeks.title': 'أسابيع التزويد',
    'home.refillWeeks.desc': 'أنشئ أوامر شراء للأصناف قليلة التغطية',
    'home.expiryGuard.title': 'حارس الانتهاء',
    'home.expiryGuard.desc': 'عالج الانتهاء قبل التزويد',
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

  // Keep <html> dir/lang in sync
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
