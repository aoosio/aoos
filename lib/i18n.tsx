// lib/i18n.tsx
'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'ar' | 'en'
type Dict = Record<string, string>

// Back-compat aliases (remove once pages use pos.col.* and sug.*)
const ALIASES: Record<string, string> = {
  // POS
  'pos.poNumber': 'pos.col.po',
  'pos.status': 'pos.col.status',
  'pos.promised': 'pos.col.promised',
  'pos.delivered': 'pos.col.delivered',
  'pos.created': 'pos.col.created',
  // Suggestions
  'suggestions.title': 'sug.title',
  'suggestions.create': 'sug.createPO',
  'suggestions.type': 'sug.col.type',
  'suggestions.reason': 'sug.col.reason',
  'suggestions.recQty': 'sug.col.qty',
  'suggestions.status': 'sug.col.status',
  'suggestions.created': 'sug.col.created',
}

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
    'common.languageTag': 'Language',

    // nav (global/admin)
    'nav.people': 'People',
    'nav.support': 'Support',
    'nav.admin': 'Admin',
    'nav.adminDashboard': 'Dashboard',
    'nav.adminMessages': 'Messages',

    // nav (app)
    'nav.home': 'Home',
    'nav.suggestions': 'Suggestions',
    'nav.pos': 'Purchase Orders',
    'nav.suppliers': 'Suppliers',
    'nav.uploads': 'Uploads',
    'nav.outbox': 'Outbox',
    'nav.templates': 'Templates',
    'nav.audit': 'Audit',
    'nav.settings': 'Settings',
    'nav.team': 'Team',

    // Team
    'team.title': 'Team',
    'team.inviteEmail': 'Email to invite',
    'team.inviteHint': 'We will email a magic link and add them as a PO Manager.',
    'team.inviteBtn': 'Invite manager',
    'team.sending': 'Sending…',
    'team.sent': 'Invitation sent.',
    'team.ownerOnly': 'Only owners can invite and manage members.',
    'team.members': 'Members',
    'team.col.role': 'Role',
    'team.col.email': 'Email',
    'team.col.status': 'Status',
    'team.col.joined': 'Joined',
    'team.active': 'Active',
    'team.inactive': 'Inactive',
    'team.ownerBadge': 'Owner',
    'team.activate': 'Activate',
    'team.deactivate': 'Deactivate',
    'team.enterEmail': 'Enter an email.',

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

    // audit
    'audit.title': 'Audit Log',
    'audit.meta': 'Meta',
    'audit.entity': 'Entity',
    'audit.action': 'Action',
    'audit.actor': 'Actor',
    'audit.time': 'Time',

    // pos
    'pos.title': 'Purchase Orders',
    'pos.new': 'New PO',
    'pos.col.po': 'PO #',
    'pos.col.status': 'Status',
    'pos.col.promised': 'Promised',
    'pos.col.delivered': 'Delivered',
    'pos.col.created': 'Created',

    // suggestions
    'sug.title': 'Suggestions',
    'sug.createPO': 'Create PO',
    'sug.col.type': 'Type',
    'sug.col.reason': 'Reason',
    'sug.col.qty': 'Rec. Qty',
    'sug.col.status': 'Status',
    'sug.col.created': 'Created',
    'sug.col.actions': '',

    // home
    'home.stats.openInquiries': 'Open inquiries',
    'home.stats.failedSends': 'Failed WhatsApp sends (last 30d)',
    'home.stats.pendingSuggestions': 'Pending suggestions',
    'home.cta.inquiries': 'Go to inquiries',
    'home.cta.outbox': 'See outbox',
    'home.cta.reviewNow': 'Review now',
    'home.openSuggestions': 'Open suggestions',
    'home.nextActions': 'Next actions',
    'home.actions.bulkPrice.title': 'Bulk Price',
    'home.actions.bulkPrice.desc': 'Ask for tier price where it makes sense',
    'home.actions.refillWeeks.title': 'Refill Weeks',
    'home.actions.refillWeeks.desc': 'Create POs for low-cover SKUs',
    'home.actions.expiryGuard.title': 'Expiry Guard',
    'home.actions.expiryGuard.desc': 'Resolve expiries before refills',
    'home.ready': 'Ready',
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
    'common.languageTag': 'اللغة',

    // nav (global/admin)
    'nav.people': 'الأشخاص',
    'nav.support': 'الدعم',
    'nav.admin': 'لوحة التحكم',
    'nav.adminDashboard': 'الإحصائيات',
    'nav.adminMessages': 'الرسائل',

    // nav (app)
    'nav.home': 'الرئيسية',
    'nav.suggestions': 'الاقتراحات',
    'nav.pos': 'أوامر الشراء',
    'nav.suppliers': 'المورّدون',
    'nav.uploads': 'الرفع',
    'nav.outbox': 'صندوق واتساب',
    'nav.templates': 'القوالب',
    'nav.audit': 'السجل',
    'nav.settings': 'الإعدادات',
    'nav.team': 'الفريق',

    // Team
    'team.title': 'الفريق',
    'team.inviteEmail': 'بريد المدير للدعوة',
    'team.inviteHint': 'سنرسل رابط دخول ونضيفه كمسؤول مشتريات.',
    'team.inviteBtn': 'دعوة مدير مشتريات',
    'team.sending': 'جارٍ الإرسال…',
    'team.sent': 'تم إرسال الدعوة.',
    'team.ownerOnly': 'فقط المالك يمكنه دعوة وإدارة الأعضاء.',
    'team.members': 'الأعضاء',
    'team.col.role': 'الدور',
    'team.col.email': 'البريد',
    'team.col.status': 'الحالة',
    'team.col.joined': 'تاريخ الانضمام',
    'team.active': 'نشط',
    'team.inactive': 'غير نشط',
    'team.ownerBadge': 'مالك',
    'team.activate': 'تفعيل',
    'team.deactivate': 'إلغاء التفعيل',
    'team.enterEmail': 'أدخل بريداً إلكترونياً.',

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

    // audit
    'audit.title': 'سجل التدقيق',
    'audit.meta': 'البيانات',
    'audit.entity': 'الكيان',
    'audit.action': 'الإجراء',
    'audit.actor': 'الفاعل',
    'audit.time': 'الوقت',

    // pos
    'pos.title': 'أوامر الشراء',
    'pos.new': 'أمر شراء جديد',
    'pos.col.po': 'رقم الأمر',
    'pos.col.status': 'الحالة',
    'pos.col.promised': 'الموعود',
    'pos.col.delivered': 'تم التسليم',
    'pos.col.created': 'الإنشاء',

    // suggestions
    'sug.title': 'الاقتراحات',
    'sug.createPO': 'إنشاء أمر شراء',
    'sug.col.type': 'النوع',
    'sug.col.reason': 'السبب',
    'sug.col.qty': 'الكمية المقترحة',
    'sug.col.status': 'الحالة',
    'sug.col.created': 'الإنشاء',
    'sug.col.actions': '',

    // home
    'home.stats.openInquiries': 'الاستفسارات المفتوحة',
    'home.stats.failedSends': 'محاولات واتساب الفاشلة (آخر 30 يوماً)',
    'home.stats.pendingSuggestions': 'الاقتراحات المعلّقة',
    'home.cta.inquiries': 'اذهب إلى الاستفسارات',
    'home.cta.outbox': 'عرض الصندوق',
    'home.cta.reviewNow': 'مراجعة الآن',
    'home.openSuggestions': 'الاقتراحات المفتوحة',
    'home.nextActions': 'الإجراءات التالية',
    'home.actions.bulkPrice.title': 'سعر الجملة',
    'home.actions.bulkPrice.desc': 'اطلب سعر الشرائح عند الحاجة',
    'home.actions.refillWeeks.title': 'أسابيع التعبئة',
    'home.actions.refillWeeks.desc': 'أنشئ أوامر شراء للأصناف قليلة التغطية',
    'home.actions.expiryGuard.title': 'حارس الصلاحية',
    'home.actions.expiryGuard.desc': 'حلّ الانتهاءات قبل التعبئة',
    'home.ready': 'جاهز',
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const t = (key: string) => {
    const k = ALIASES[key] ?? key
    const v = DICT[lang][k] ?? DICT.en[k]
    if (v === undefined) {
      if (typeof window !== 'undefined') console.warn('[i18n] Missing key:', key, '(resolved:', k, ')')
      return key
    }
    return v
  }

  const value = useMemo(() => ({ lang, setLang, t }), [lang])

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
