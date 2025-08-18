'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Index() {
  const router = useRouter()
  useEffect(() => { router.replace('/home') }, [router])
  return <main className="p-6">Redirecting…</main>
}
