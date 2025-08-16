// lib/i18n.tsx
'use client'

import * as React from 'react'

type Locale = 'en' | 'ar'
const STORAGE_KEY = 'aoos.lang'

const LANGS: Record<Locale, { label: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', dir: 'ltr' },
  ar: { label: 'العربية', dir: 'rtl' },
}

// -----------------------------
// Dictionary (EN / AR)
// -----------------------------
type Leaf = { en: string; ar: string }
type Namespace = Record<string, Leaf>
type Dict = Record<
  | 'common'
  | 'nav'
  | 'home'
  | 'sug'
  | 'pos'
  | 'suppliers'
  | 'uploads'
  | 'outbox'
  | 'templates'
  | 'audit'
  | 'settings'
  | 'team',
  Namespace
>

export const DICT: Dict = {
  common: {
    appName: { en: 'AOOS', ar: 'AOOS' },
    languageTag: { en: 'Language', ar: 'اللغة' },
    english: { en: 'English', ar: 'الإنجليزية' },
    arabic: { en: 'Arabic', ar: 'العربية' },
    signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
    signOut: { en: 'Sign out', ar: 'تسجيل الخروج' },
    save: { en: 'Save', ar: 'حفظ' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    edit: { en: 'Edit', ar: 'تعديل' },
    delete: { en: 'Delete', ar: 'حذف' },
    update: { en: 'Update', ar: 'تحديث' },
    created: { en: 'Created', ar: 'تم الإنشاء' },
    updated: { en: 'Updated', ar: 'تم التحديث' },
    status: { en: 'Status', ar: 'الحالة' },
    actions: { en: 'Actions', ar: 'الإجراءات' },
    loading: { en: 'Loading…', ar: 'جارٍ التحميل…' },
    error: { en: 'Error', ar: 'خطأ' },
    success: { en: 'Success', ar: 'تم بنجاح' },
    search: { en: 'Search', ar: 'بحث' },
    next: { en: 'Next', ar: 'التالي' },
    back: { en: 'Back', ar: 'رجوع' },
    owner: { en: 'Owner', ar: 'المالك' },
    admin: { en: 'Admin', ar: 'مدير' },
    po_manager: { en: 'PO Manager', ar: 'مسؤول الطلبات' },
  },

  nav: {
    home: { en: 'Home', ar: 'الرئيسية' },
    suggestions: { en: 'Suggestions', ar: 'الاقتراحات' },
    pos: { en: 'Purchase Orders', ar: 'أوامر الشراء' },
    suppliers: { en: 'Suppliers', ar: 'الموردون' },
    uploads: { en: 'Uploads', ar: 'الملفات' },
    outbox: { en: 'Outbox', ar: 'الصادر' },
    templates: { en: 'Templates', ar: 'القوالب' },
    audit: { en: 'Audit', ar: 'السجل' },
    settings: { en: 'Settings', ar: 'الإعدادات' },
    team: { en: 'Team', ar: 'الفريق' },
  },

  home: {
    title: { en: 'From insight to action', ar: 'من البيانات نتخذ القرارات' },
    subtitle: {
      en: 'Send supplier-ready POs from sales & stock data.',
      ar: 'أرسل أوامر شراء جاهزة للموردين من بيانات المبيعات والمخزون.',
    },
    statsSuppliers: { en: 'Suppliers', ar: 'الموردون' },
    statsMessages: { en: 'WhatsApp messages', ar: 'رسائل واتساب' },
    statsPOs: { en: 'POs created', ar: 'أوامر شراء' },
    ready: { en: 'You are ready to start.', ar: 'أنت جاهز للبدء.' },
    ctaSuppliers: { en: 'Add suppliers', ar: 'أضف الموردين' },
    ctaUploads: { en: 'Upload CSVs', ar: 'ارفع ملفات CSV' },
  },

  sug: {
    title: { en: 'Suggestions', ar: 'الاقتراحات' },
    empty: { en: 'No suggestions yet.', ar: 'لا توجد اقتراحات بعد.' },
    accept: { en: 'Accept', ar: 'قبول' },
    dismiss: { en: 'Dismiss', ar: 'تجاهل' },
    sent: { en: 'Sent', ar: 'تم الإرسال' },
  },

  pos: {
    title: { en: 'Purchase Orders', ar: 'أوامر الشراء' },
    approve: { en: 'Approve', ar: 'اعتماد' },
    dispatch: { en: 'Dispatch', ar: 'إرسال' },
    empty: { en: 'No purchase orders yet.', ar: 'لا توجد أوامر شراء بعد.' },
  },

  suppliers: {
    title: { en: 'Suppliers', ar: 'الموردون' },
    name: { en: 'Name', ar: 'الاسم' },
    phone: { en: 'Phone (E.164)', ar: 'الهاتف (E.164)' },
    preferred_language: { en: 'Language', ar: 'اللغة' },
    add: { en: 'Add supplier', ar: 'إضافة مورد' },
    edit: { en: 'Edit supplier', ar: 'تعديل مورد' },
    saveSupplier: { en: 'Save supplier', ar: 'حفظ المورد' },
    deleteConfirm: { en: 'Delete supplier?', ar: 'حذف المورد؟' },
    updatedAt: { en: 'Updated', ar: 'آخر تحديث' },
  },

  uploads: {
    title: { en: 'Uploads', ar: 'الملفات' },
    salesUpload: { en: 'Upload Sales CSV', ar: 'رفع CSV المبيعات' },
    stockUpload: { en: 'Upload Stock CSV', ar: 'رفع CSV المخزون' },
    templateSales: { en: 'Download Sales Template', ar: 'تحميل قالب المبيعات' },
    templateStock: { en: 'Download Stock Template', ar: 'تحميل قالب المخزون' },
    processed: { en: 'Processed', ar: 'مُعالج' },
    failed: { en: 'Failed', ar: 'فشل' },
    inProgress: { en: 'In progress', ar: 'قيد المعالجة' },
  },

  outbox: {
    title: { en: 'Outbox', ar: 'الصادر' },
    toPhone: { en: 'To (phone)', ar: 'إلى (الهاتف)' },
    message: { en: 'Message', ar: 'الرسالة' },
    send: { en: 'Send test', ar: 'إرسال تجربة' },
    status: { en: 'Status', ar: 'الحالة' },
    providerStatus: { en: 'Provider status', ar: 'حالة المزوّد' },
    createdAt: { en: 'Created', ar: 'أُنشئ' },
  },

  templates: {
    title: { en: 'Message Templates', ar: 'قوالب الرسائل' },
    ownerOnly: {
      en: 'Only Platform Owners can edit templates.',
      ar: 'فقط مالكو المنصّة يمكنهم تعديل القوالب.',
    },
    templateName: { en: 'Template name', ar: 'اسم القالب' },
    editBody: { en: 'Body (owner editable)', ar: 'المتن (قابل للتعديل من المالك)' },
    systemFacts: { en: 'System Facts (immutable)', ar: 'حقائق النظام (ثابتة)' },
    saveTemplate: { en: 'Save template', ar: 'حفظ القالب' },
  },

  audit: {
    title: { en: 'Audit Log', ar: 'سجل التدقيق' },
    time: { en: 'Time', ar: 'الوقت' },
    action: { en: 'Action', ar: 'الإجراء' },
    actor: { en: 'Actor', ar: 'الفاعل' },
    entity: { en: 'Entity', ar: 'الكيان' },
    meta: { en: 'Details', ar: 'التفاصيل' },
    empty: { en: 'No audit entries yet.', ar: 'لا توجد سجلات بعد.' },
  },

  settings: {
    title: { en: 'Settings', ar: 'الإعدادات' },
    org: { en: 'Organization', ar: 'المؤسسة' },
    ssi_days: { en: 'Safety stock (days)', ar: 'مخزون الأمان (أيام)' },
    sla_target_days: { en: 'SLA target (days)', ar: 'هدف SLA (أيام)' },
    default_dial_code: { en: 'Default dial code', ar: 'مقدمة الاتصال الافتراضية' },
    saveSettings: { en: 'Save settings', ar: 'حفظ الإعدادات' },
    whatsappConnect: { en: 'Connect WhatsApp', ar: 'ربط واتساب' },
    phoneNumberId: { en: 'Phone Number ID', ar: 'معرّف رقم الهاتف' },
    wabaId: { en: 'WABA ID', ar: 'معرّف WABA' },
    accessToken: { en: 'Access Token', ar: 'رمز الوصول' },
    testConnection: { en: 'Test connection', ar: 'اختبار الاتصال' },
  },

  // Team namespace
  team: {
    heading: { en: 'Team', ar: 'الفريق' },
    emailToInvite: { en: 'Email to invite', ar: 'البريد الإلكتروني للدعوة' },
    sendInvite: { en: 'Send invite', ar: 'إرسال الدعوة' },
    pendingInvites: { en: 'Pending invites', ar: 'الدعوات المعلّقة' },
    members: { en: 'Members', ar: 'الأعضاء' },
    onlyOwner: {
      en: 'Only the market owner can send invites.',
      ar: 'فقط مالك السوق يمكنه إرسال الدعوات.',
    },
    noInvites: { en: 'No invites.', ar: 'لا توجد دعوات.' },
    user: { en: 'User', ar: 'المستخدم' },
    role: { en: 'Role', ar: 'الدور' },
    since: { en: 'Since', ar: 'منذ' },
    status: { en: 'Status', ar: 'الحالة' },
    created: { en: 'Created', ar: 'تم الإنشاء' },
  },
}

// -----------------------------
// I18n runtime
// -----------------------------
type I18nCtx = {
  // Canonical API
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  t: (key: `${keyof Dict}.${string}` | string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
  // Back-compat aliases (for existing components)
  lang: Locale
  setLang: (l: Locale) => void
}
const I18nContext = React.createContext<I18nCtx | null>(null)

function resolveLeaf(key: string): Leaf | null {
  const [ns, k] = key.split('.', 2)
  if (!ns || !k) return null
  const space = (DICT as any)[ns] as Namespace | undefined
  if (!space) return null
  const leaf = space[k] as Leaf | undefined
  return leaf ?? null
}

function interpolate(s: string, params?: Record<string, string | number>) {
  if (!params) return s
  return s.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('en')

  // init from storage / browser
  React.useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored)
    } else {
      const guess = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
      setLocaleState(guess.startsWith('ar') ? 'ar' : 'en')
    }
  }, [])

  // apply <html lang/dir>
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = LANGS[locale].dir
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale)
    }
  }, [locale])

  const setLocale = React.useCallback((l: Locale) => setLocaleState(l), [])
  const toggleLocale = React.useCallback(() => {
    setLocaleState((l) => (l === 'en' ? 'ar' : 'en'))
  }, [])

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const leaf = resolveLeaf(key)
      if (leaf) {
        const raw = (leaf as any)[locale] ?? leaf.en
        return interpolate(raw, params)
      }
      const commonLeaf = (DICT.common as any)[key]
      if (commonLeaf) {
        const raw = (commonLeaf as any)[locale] ?? commonLeaf.en
        return interpolate(raw, params)
      }
      return key
    },
    [locale]
  )

  const value = React.useMemo<I18nCtx>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      dir: LANGS[locale].dir,
      // aliases
      lang: locale,
      setLang: setLocale,
    }),
    [locale, setLocale, toggleLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}

export { LANGS }
