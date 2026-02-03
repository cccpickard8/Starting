'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login, signup } from '@/lib/auth-actions'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    const action = mode === 'login' ? login : signup
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Lime green panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-lime-400 p-12 flex-col justify-between">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 bg-green-800 rounded-lg"></div>
          <div className="w-5 h-5 bg-green-800 rounded-md -ml-2.5 -mt-5"></div>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-green-900 leading-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join Our Community'}
          </h1>
          <p className="mt-6 text-green-800 text-xl leading-relaxed max-w-md">
            {mode === 'login'
              ? 'Sign in to continue trading books with fellow readers.'
              : 'Start trading books with readers in your community today.'}
          </p>
        </div>

        <p className="text-green-800 text-sm">
          Connecting readers, one book at a time.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex items-center gap-0.5">
              <div className="w-8 h-8 bg-green-700 rounded-lg"></div>
              <div className="w-4 h-4 bg-green-700 rounded-md -ml-2 -mt-4"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">BookSwap</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="mt-3 text-gray-600">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-green-700 hover:text-green-800 font-medium">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/login" className="text-green-700 hover:text-green-800 font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>

          <form className="mt-8 space-y-6" action={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-green-700 text-white rounded-full font-semibold text-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
