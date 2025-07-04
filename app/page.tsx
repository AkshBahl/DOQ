"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Heart, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  
  const { signIn, signInWithGoogle, user, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        // After sign in, check profile completion
        // Get the current user from Supabase Auth
        const { data: authUser } = await supabase.auth.getUser()
        const userId = authUser?.user?.id
        let userData = null
        let healthData = null
        let userError = null
        let healthError = null
        if (userId) {
          // Try to fetch user row
          const userRes = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
          userData = userRes.data
          userError = userRes.error
          // If user row does not exist, create it
          if (userError && userError.code === 'PGRST116') {
            const { user } = authUser
            if (user) {
              let insertRes: any = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email,
                  first_name: user.user_metadata?.first_name || '',
                  last_name: user.user_metadata?.last_name || '',
                  subscription_tier: null,
                })
              if (!insertRes.error) {
                userData = {
                  id: user.id,
                  email: user.email,
                  first_name: user.user_metadata?.first_name || '',
                  last_name: user.user_metadata?.last_name || '',
                  subscription_tier: null,
                }
              }
            }
          }
          // Try to fetch health profile row
          const healthRes = await supabase
            .from('health_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
          healthData = healthRes.data
          healthError = healthRes.error
          // If health profile row does not exist, treat as incomplete (do not error)
          if (healthError && healthError.code === 'PGRST116') {
            healthData = null
          }
        }
        // Check required fields
        const isProfileComplete = userData &&
          userData.phone &&
          userData.date_of_birth &&
          userData.gender &&
          userData.address &&
          userData.emergency_contact &&
          healthData &&
          healthData.health_goals &&
          userData.subscription_tier
        if (!isProfileComplete) {
          // If missing personal/health info, go to complete-profile
          if (!userData?.phone || !userData?.date_of_birth || !userData?.gender || !userData?.address || !userData?.emergency_contact || !healthData?.health_goals) {
            router.push("/complete-profile")
            return
          }
          // If missing subscription, go to subscription
          if (!userData?.subscription_tier) {
            router.push("/subscription")
            return
          }
        }
        // All complete, go to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetStatus(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/reset-password' : undefined,
      })
      if (error) {
        setResetStatus("Error: " + error.message)
      } else {
        setResetStatus("Password reset email sent! Please check your inbox.")
      }
    } catch (err) {
      setResetStatus("An unexpected error occurred. Please try again.")
    }
  }

  // Handle Google OAuth or already-logged-in users
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!loading && user) {
        // Get the current user from Supabase Auth
        const { data: authUser } = await supabase.auth.getUser()
        const userId = authUser?.user?.id
        let userData = null
        let healthData = null
        let userError = null
        let healthError = null
        if (userId) {
          // Try to fetch user row
          const userRes = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
          userData = userRes.data
          userError = userRes.error
          // If user row does not exist, create it
          if (userError && userError.code === 'PGRST116') {
            const { user: u } = authUser
            if (u) {
              let insertRes: any = await supabase
                .from('users')
                .insert({
                  id: u.id,
                  email: u.email,
                  first_name: u.user_metadata?.first_name || '',
                  last_name: u.user_metadata?.last_name || '',
                  subscription_tier: null,
                })
              if (!insertRes.error) {
                userData = {
                  id: u.id,
                  email: u.email,
                  first_name: u.user_metadata?.first_name || '',
                  last_name: u.user_metadata?.last_name || '',
                  subscription_tier: null,
                }
              }
            }
          }
          // Try to fetch health profile row
          const healthRes = await supabase
            .from('health_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
          healthData = healthRes.data
          healthError = healthRes.error
          // If health profile row does not exist, treat as incomplete (do not error)
          if (healthError && healthError.code === 'PGRST116') {
            healthData = null
          }
        }
        // Check required fields
        const isProfileComplete = userData &&
          userData.phone &&
          userData.date_of_birth &&
          userData.gender &&
          userData.address &&
          userData.emergency_contact &&
          healthData &&
          healthData.health_goals &&
          userData.subscription_tier
        if (!isProfileComplete) {
          // If missing personal/health info, go to complete-profile
          if (!userData?.phone || !userData?.date_of_birth || !userData?.gender || !userData?.address || !userData?.emergency_contact || !healthData?.health_goals) {
            router.push("/complete-profile")
            return
          }
          // If missing subscription, go to subscription
          if (!userData?.subscription_tier) {
            router.push("/choose-subscription")
            return
          }
        }
        // All complete, go to dashboard
        router.push("/dashboard")
      }
    }
    checkAndRedirect()
  }, [user, loading, router])

  // Show loading spinner while checking auth state
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to DOQ</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Your AI-powered health companion</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Google Sign In Button */}
              <Button
                type="button"
                className="w-full mb-4 flex items-center justify-center gap-2"
                variant="outline"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  setError("")
                  const { error } = await signInWithGoogle()
                  if (error) setError(error.message)
                  setIsLoading(false)
                }}
              >
                <span className="inline-block w-5 h-5 mr-2 align-middle">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                    <g>
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.04 1.53 7.43 2.81l5.48-5.48C33.64 3.54 29.36 1.5 24 1.5 14.98 1.5 7.13 7.44 3.88 15.09l6.77 5.26C12.13 14.09 17.56 9.5 24 9.5z"/>
                      <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.24h12.43c-.54 2.9-2.18 5.36-4.65 7.04l7.18 5.59C43.87 37.91 46.1 31.74 46.1 24.5z"/>
                      <path fill="#FBBC05" d="M10.65 28.35c-1.01-2.99-1.01-6.21 0-9.2l-6.77-5.26C1.64 17.36 0 20.53 0 24c0 3.47 1.64 6.64 3.88 9.11l6.77-5.26z"/>
                      <path fill="#EA4335" d="M24 46.5c6.48 0 11.92-2.15 15.9-5.86l-7.18-5.59c-2.01 1.35-4.6 2.15-8.72 2.15-6.44 0-11.87-4.59-13.35-10.74l-6.77 5.26C7.13 40.56 14.98 46.5 24 46.5z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </g>
                  </svg>
                </span>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t">
              <div className="text-center">
                <Button variant="link" className="text-sm sm:text-base" onClick={() => setShowReset(true)}>
                  Forgot your password?
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <Heart className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600">AI Health</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600">Providers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
