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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
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
            router.push("/subscription")
            return
          }
        }
        // All complete, go to dashboard
        router.push("/dashboard")
      }
    }
    checkAndRedirect()
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DOQ</h1>
          <p className="text-gray-600">Doctor Q - Your Health Companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your health dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign In Button */}
            <Button
              type="button"
              className="w-full mb-4"
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
              Sign in with Google
            </Button>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center space-y-2">
                <Button variant="link" className="text-sm">
                  Forgot your password?
                </Button>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign up here
                  </Link>
                </div>
              </div>
            </form>
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
