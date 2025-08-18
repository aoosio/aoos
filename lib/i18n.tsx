'use client'
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react'

type Lang = 'en' | 'ar'
type Dict = Record<string, string>

const dictionaries: Record<Lang, Dict> = {
  en: {
    'team.title': 'Team',
    'team.onlyOwner': 'Only the organization owner can invite or remove members.',
    'team.inviteEmail': 'Invitee email',
    'team.sendInvite': 'Send invite',
    'team.user': 'User',
    'team.role': 'Role',
    'team.status': 'Status',
    'team.noInvites': 'No members or invites yet.',
  },
  ar: {
    'team.title': 'الفريق',
    'team.onlyOwner': 'فقط مالك المؤسسة يستطيع دعوة أو حذف الأعضاء.',
    'team.inviteEmail': 'بريد المدعو',
    'team.sendInvite': 'إرسال الدعوة',
    'team.user': 'المستخدم',
    'team.role': 'الدور',
    'team.status': 'الحالة',
    'team.noInvites': 'لا يوجد أعضاء أو دعوات بعد.',
  },
}

function format(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str
  return Object.keys(vars).reduce((s, k) => s.replace(new RegExp(`{${k}}`, 'g'), String(vars[k])), str)
}

export type I18n = {
  lang: Lang
  t: (key: string, vars?: Record<string, string | number>) => string
  setLang: (l: Lang) => void
}

const defaultI18n: I18n = {
  lang: 'en',
  t: (key, vars) => format(dictionaries.en[key] ?? key, vars),
  setLang: () => {},
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang ?? 'en')
  const value = useMemo<I18n>(() => ({
    lang,
    setLang,
    t: (key, vars) => {
      const d = dictionaries[lang] ?? dictionaries.en
      return format(d[key] ?? key, vars)
    },
  }), [lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Safe: falls back to English if no provider is present (prevents build crashes). */
export function useI18n(): I18n {
  return useContext(Ctx) ?? defaultI18n
}
