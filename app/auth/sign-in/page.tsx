// app/auth/sign-in/page.tsx
import SignInForm from './sign-in-form'

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { redirect?: string | string[] }
}) {
  const raw = Array.isArray(searchParams?.redirect)
    ? searchParams?.redirect[0]
    : searchParams?.redirect

  // prevent open redirects; fallback to /home
  const redirect = typeof raw === 'string' && raw.startsWith('/') ? raw : '/home'
  return <SignInForm redirect={redirect} />
}
