// lib/i18n.tsx
'use client'

import * as React from 'react'

/**
 * AOOS i18n — deep-key dictionary with back-compat aliases.
 * Fixes missing keys on: home, suggestions, pos, uploads, audit, outbox, team, settings.
 * Usage: const { t, lang, setLang, toggleLocale } = useI18n(); t('home.stats.openInquiries')
 */

type Locale = 'en' | 'ar'
const STORAGE_KEY = 'aoos.lang'

export const LANGS: Record<Locale, { label: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', dir: 'ltr' },
  ar: { label: 'العربية', dir: 'rtl' },
}

type Leaf = { en: string; ar: string }
type DictTree = { [key: string]: Leaf | DictTree }

// -----------------------------
// Dictionary (exact keys used by pages)
// -----------------------------
const DICT: DictTree = {
  common: {
    languageTag: { en: 'Language', ar: 'اللغة' },
    english: { en: 'English', ar: 'الإنجليزية' },
    arabic: { en: 'Arabic', ar: 'العربية' },
    signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
    signOut: { en: 'Sign out', ar: 'تسجيل الخروج' },
    save: { en: 'Save', ar: 'حفظ' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    created: { en: 'Created', ar: 'أُنشئ' },
    status: { en: 'Status', ar: 'الحالة' },

    // Settings shared fields
    defaultLanguage: { en: 'Default language', ar: 'اللغة الافتراضية' },
    ssiDays: { en: 'Safety stock (days)', ar: 'مخزون الأمان (أيام)' },
    slaTargetDays: { en: 'SLA target (days)', ar: 'هدف SLA (أيام)' },
    defaultDialCode: { en: 'Default dial code', ar: 'مقدمة الاتصال الافتراضية' },
  },

  nav: {
    home: { en: 'Home', ar: 'الرئيسية' },
    suggestions: { en: 'Suggestions', ar: 'الاقتراحات' },
    pos: { en: 'Purchase Orders', ar: 'أوامر الشراء' },
    team: { en: 'Team', ar: 'الفريق' },
    suppliers: { en: 'Suppliers', ar: 'الموردون' },
    uploads: { en: 'Uploads', ar: 'الملفات' },
    outbox: { en: 'Outbox', ar: 'الصادر' },
    templates: { en: 'Templates', ar: 'القوالب' },
    audit: { en: 'Audit', ar: 'السجل' },
    settings: { en: 'Settings', ar: 'الإعدادات' },
    support: { en: 'Support', ar: 'الدعم' },
  },

  // HOME (matches visible keys in the UI)
  home: {
    title: { en: 'From insight to action', ar: 'من البيانات نتخذ القرارات' },
    subtitle: {
      en: 'Send supplier-ready POs from sales & stock data.',
      ar: 'أرسل أوامر شراء جاهزة للموردين من بيانات المبيعات والمخزون.',
    },
    ready: { en: 'You are ready to start.', ar: 'أنت جاهز للبدء.' },

    stats: {
      openInquiries: { en: 'Open inquiries', ar: 'استفسارات مفتوحة' },
      failedSends: { en: 'Failed sends', ar: 'محاولات إرسال فاشلة' },
      pendingSuggestions: { en: 'Pending suggestions', ar: 'اقتراحات قيد الانتظار' },
    },

    cta: {
      inquiries: { en: 'Open inquiries', ar: 'عرض الاستفسارات' },
      outbox: { en: 'Open outbox', ar: 'فتح الصادر' },
      reviewNow: { en: 'Review now', ar: 'راجع الآن' },
    },

    openSuggestions: { en: 'Open suggestions', ar: 'عرض الاقتراحات' },
    nextActions: { en: 'Next actions', ar: 'الخطوات التالية' },

    actions: {
      bulkPrice: {
        title: { en: 'Bulk price opportunity', ar: 'فرصة سعر بالجملة' },
        desc: {
          en: 'Order more now to unlock a better tier.',
          ar: 'اطلب كمية أكبر الآن للحصول على شريحة سعر أفضل.',
        },
      },
      refillWeeks: {
        title: { en: 'Refill needed (weeks)', ar: 'إعادة تعبئة مطلوبة (أسابيع)' },
        desc: {
          en: 'Stock will run out before target buffer.',
          ar: 'سينفد المخزون قبل هامش الأمان المستهدف.',
        },
      },
      expiryGuard: {
        title: { en: 'Expiry guard', ar: 'حماية من انتهاء الصلاحية' },
        desc: {
          en: 'Rotate soon-to-expire items first.',
          ar: 'قم بتدوير الأصناف القريبة من الانتهاء أولاً.',
        },
      },
    },
  },

  // SUGGESTIONS (page uses "suggestions.*" keys)
  suggestions: {
    title: { en: 'Suggestions', ar: 'الاقتراحات' },
    create: { en: 'Create PO from selection', ar: 'إنشاء أمر شراء من التحديد' },
    type: { en: 'Type', ar: 'النوع' },
    reason: { en: 'Reason', ar: 'السبب' },
    recQty: { en: 'Recommended qty', ar: 'الكمية المقترحة' },
    status: { en: 'Status', ar: 'الحالة' },
    created: { en: 'Created', ar: 'أُنشئ' },

    // Common reasons (if rendered anywhere)
    reasons: {
      refill: { en: 'Refill', ar: 'إعادة تزويد' },
      expiry: { en: 'Expiry risk', ar: 'خطر انتهاء الصلاحية' },
      overstock: { en: 'Overstock', ar: 'تكدّس المخزون' },
      bulk: { en: 'Bulk discount', ar: 'خصم الجملة' },
    },
  },

  // PURCHASE ORDERS (page uses "pos.*" keys)
  pos: {
    title: { en: 'Purchase Orders', ar: 'أوامر الشراء' },
    new: { en: 'New PO', ar: 'أمر شراء جديد' },
    poNumber: { en: 'PO #', ar: 'رقم أمر الشراء' },
    status: { en: 'Status', ar: 'الحالة' },
    promised: { en: 'Promised', ar: 'التسليم المتعهد' },
    delivered: { en: 'Delivered', ar: 'تم التسليم' },
    created: { en: 'Created', ar: 'أُنشئ' },
    approve: { en: 'Approve', ar: 'اعتماد' },
    dispatch: { en: 'Dispatch', ar: 'إرسال' },
    markDelivered: { en: 'Mark delivered', ar: 'وضع علامة تم التسليم' },
  },

  // UPLOADS (page uses "uploads.*" keys like salesCsv, stockCsv, uploadSales, uploadStock)
  uploads: {
    title: { en: 'Uploads', ar: 'الملفات' },

    salesCsv: { en: 'Sales CSV', ar: 'CSV المبيعات' },
    salesCols: {
      en: 'Columns: product, sold_qty',
      ar: 'الأعمدة: المنتج، الكمية المباعة',
    },
    uploadSales: { en: 'Upload Sales CSV', ar: 'رفع CSV المبيعات' },

    stockCsv: { en: 'Stock CSV', ar: 'CSV المخزون' },
    stockCols: {
      en: 'Columns: product, qty, expiry_date?, distributor?, distributor_phone?',
      ar: 'الأعمدة: المنتج، الكمية، تاريخ الانتهاء؟، الموزّع؟، هاتف الموزّع؟',
    },
    uploadStock: { en: 'Upload Stock CSV', ar: 'رفع CSV المخزون' },

    templateSales: { en: 'Download Sales Template', ar: 'تحميل قالب المبيعات' },
    templateStock: { en: 'Download Stock Template', ar: 'تحميل قالب المخزون' },

    processed: { en: 'Processed', ar: 'مُعالج' },
    failed: { en: 'Failed', ar: 'فشل' },
    inProgress: { en: 'In progress', ar: 'قيد المعالجة' },

    // Back‑compat keys used earlier in some components
    salesUpload: { en: 'Upload Sales CSV', ar: 'رفع CSV المبيعات' },
    stockUpload: { en: 'Upload Stock CSV', ar: 'رفع CSV المخزون' },
  },

  // OUTBOX
  outbox: {
    title: { en: 'Outbox', ar: 'الصادر' },
    to: { en: 'To (phone)', ar: 'إلى (الهاتف)' },
    toPhone: { en: 'To (phone)', ar: 'إلى (الهاتف)' }, // alias
    text: { en: 'Message', ar: 'الرسالة' },
    sendTest: { en: 'Send test', ar: 'إرسال تجربة' },
    providerStatus: { en: 'Provider status', ar: 'حالة المزوّد' },
    createdAt: { en: 'Created', ar: 'أُنشئ' },
  },

  // TEMPLATES (minimal)
  templates: {
    title: { en: 'Message Templates', ar: 'قوالب الرسائل' },
    ownerOnly: {
      en: 'Only Platform Owners can edit templates.',
      ar: 'فقط مالكو المنصّة يمكنهم تعديل القوالب.',
    },
  },

  // AUDIT
  audit: {
    title: { en: 'Audit Log', ar: 'سجل التدقيق' },
    time: { en: 'Time', ar: 'الوقت' },
    action: { en: 'Action', ar: 'الإجراء' },
    actor: { en: 'Actor', ar: 'الفاعل' },
    entity: { en: 'Entity', ar: 'الكيان' },
    details: { en: 'Details', ar: 'التفاصيل' },
    empty: { en: 'No audit entries yet.', ar: 'لا توجد سجلات بعد.' },
  },

  // SETTINGS (and WhatsApp connect form)
  settings: {
    title: { en: 'Settings', ar: 'الإعدادات' },
    org: { en: 'Organization', ar: 'المؤسسة' },
    whatsappConnect: { en: 'Connect WhatsApp', ar: 'ربط واتساب' },
    phoneNumberId: { en: 'Phone Number ID', ar: 'معرّف رقم الهاتف' },
    wabaId: { en: 'WABA ID', ar: 'معرّف WABA' },
    accessToken: { en: 'Access Token', ar: 'رمز الوصول' },
    testConnection: { en: 'Test connection', ar: 'اختبار الاتصال' },
    saveSettings: { en: 'Save settings', ar: 'حفظ الإعدادات' },
  },

  // TEAM
  team: {
    title: { en: 'Team', ar: 'الفريق' },
    heading: { en: 'Team', ar: 'الفريق' }, // alias for components using .heading
    inviteEmail: { en: 'Email to invite', ar: 'البريد الإلكتروني للدعوة' },
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
// Helpers
// -----------------------------
/** Deep getter: traverses DICT by 'a.b.c' path and returns a Leaf or null. */
function getLeafDirect(path: string): Leaf | null {
  const parts = path.split('.')
  let node: any = DICT
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) {
      node = node[p]
    } else {
      return null
    }
  }
  if (node && typeof node === 'object' && 'en' in node && 'ar' in node) {
    return node as Leaf
  }
  return null
}

/** Alias mapper for back-compat keys used in older components. */
function aliasPath(path: string): string {
  // sug.* → suggestions.*
  if (path.startsWith('sug.')) return 'suggestions.' + path.slice(4)

  // uploads.salesUpload → uploads.uploadSales; uploads.stockUpload → uploads.uploadStock
  if (path === 'uploads.salesUpload') return 'uploads.uploadSales'
  if (path === 'uploads.stockUpload') return 'uploads.uploadStock'

  // outbox.toPhone → outbox.to
  if (path === 'outbox.toPhone') return 'outbox.to'

  // team.heading/title interchangeable
  if (path === 'team.heading') return 'team.title'

  return path
}

function getLeaf(path: string): Leaf | null {
  const direct = getLeafDirect(path)
  if (direct) return direct
  const aliased = aliasPath(path)
  if (aliased !== path) {
    const viaAlias = getLeafDirect(aliased)
    if (viaAlias) return viaAlias
  }
  // fallback: try common.<key>
  const common = getLeafDirect(`common.${path}`)
  return common
}

function interpolate(s: string, params?: Record<string, string | number>) {
  if (!params) return s
  return s.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

// -----------------------------
// Context
// -----------------------------
type I18nCtx = {
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
  // Back-compat aliases used in some components
  lang: Locale
  setLang: (l: Locale) => void
}

const I18nContext = React.createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('en')

  React.useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored)
    } else {
      const guess = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
      setLocaleState(guess.startsWith('ar') ? 'ar' : 'en')
    }
  }, [])

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
      const leaf = getLeaf(key)
      if (leaf) {
        const raw = (leaf as any)[locale] ?? (leaf as any).en
        return interpolate(raw, params)
      }
      return key // show the key for fast debugging if truly missing
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
