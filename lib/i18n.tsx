// lib/i18n.tsx
'use client'

import * as React from 'react'

type Locale = 'en' | 'ar'
const STORAGE_KEY = 'aoos.lang'

export const LANGS: Record<Locale, { label: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', dir: 'ltr' },
  ar: { label: 'العربية', dir: 'rtl' },
}

type Leaf = { en: string; ar: string }
type DictTree = { [key: string]: Leaf | DictTree }

/**
 * NOTE:
 * - Keys mirror UI usage (deep dot paths), e.g. 'home.stats.openInquiries', 'team.title', 'outbox.to'.
 * - Add/adjust texts here without changing component code.
 */
const DICT: DictTree = {
  common: {
    languageTag: { en: 'Language', ar: 'اللغة' },
    english: { en: 'English', ar: 'الإنجليزية' },
    arabic: { en: 'Arabic', ar: 'العربية' },
    signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
    signOut: { en: 'Sign out', ar: 'تسجيل الخروج' },
    save: { en: 'Save', ar: 'حفظ' },

    // Used on /settings
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
  },

  // HOME
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

  // TEAM
  team: {
    title: { en: 'Team', ar: 'الفريق' },
    heading: { en: 'Team', ar: 'الفريق' }, // alias, in case some components use .heading
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

  // OUTBOX
  outbox: {
    title: { en: 'Outbox', ar: 'الصادر' },
    to: { en: 'To (phone)', ar: 'إلى (الهاتف)' },
    text: { en: 'Message', ar: 'الرسالة' },
    sendTest: { en: 'Send test', ar: 'إرسال تجربة' },
  },

  // SUPPLIERS (kept minimal; current UI shows English labels already)
  suppliers: {
    title: { en: 'Suppliers', ar: 'الموردون' },
    name: { en: 'Name', ar: 'الاسم' },
    phone: { en: 'Phone (WhatsApp)', ar: 'الهاتف (واتساب)' },
    preferred_language: { en: 'Language', ar: 'اللغة' },
    add: { en: 'Add supplier', ar: 'إضافة مورد' },
    updatedAt: { en: 'Updated', ar: 'آخر تحديث' },
  },

  // UPLOADS (minimal)
  uploads: {
    title: { en: 'Uploads', ar: 'الملفات' },
    salesUpload: { en: 'Upload Sales CSV', ar: 'رفع CSV المبيعات' },
    stockUpload: { en: 'Upload Stock CSV', ar: 'رفع CSV المخزون' },
    templateSales: { en: 'Download Sales Template', ar: 'تحميل قالب المبيعات' },
    templateStock: { en: 'Download Stock Template', ar: 'تحميل قالب المخزون' },
  },

  templates: {
    title: { en: 'Message Templates', ar: 'قوالب الرسائل' },
    ownerOnly: {
      en: 'Only Platform Owners can edit templates.',
      ar: 'فقط مالكو المنصّة يمكنهم تعديل القوالب.',
    },
  },

  audit: {
    title: { en: 'Audit Log', ar: 'سجل التدقيق' },
  },

  settings: {
    title: { en: 'Settings', ar: 'الإعدادات' },
    org: { en: 'Organization', ar: 'المؤسسة' },
    whatsappConnect: { en: 'Connect WhatsApp', ar: 'ربط واتساب' },
    phoneNumberId: { en: 'Phone Number ID', ar: 'معرّف رقم الهاتف' },
    wabaId: { en: 'WABA ID', ar: 'معرّف WABA' },
    accessToken: { en: 'Access Token', ar: 'رمز الوصول' },
    testConnection: { en: 'Test connection', ar: 'اختبار الاتصال' },
  },
}

/** Deep getter: traverses DICT by 'a.b.c' path and returns a Leaf or null. */
function getLeaf(path: string): Leaf | null {
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

function interpolate(s: string, params?: Record<string, string | number>) {
  if (!params) return s
  return s.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

type I18nCtx = {
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
  // Back-compat aliases for existing components:
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
      // fallback: if they passed bare token like 'save' try 'common.save'
      const common = getLeaf(`common.${key}`)
      if (common) {
        const raw = (common as any)[locale] ?? (common as any).en
        return interpolate(raw, params)
      }
      return key // show the key if not found (debug-friendly)
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
      // aliases for existing components
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
