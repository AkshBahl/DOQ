"use client"

import { useState } from "react"
import { Eye, EyeOff, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { signUp } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validate = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
          setError("Please fill in all required fields")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long")
          return false
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError("Please enter a valid email address")
          return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setError("")
    try {
      const { data, error: authError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      })
      if (authError) {
        setError(authError.message)
        return
      }
      // Redirect to sign in or profile completion
      router.push("/") // redirect to sign in page
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Join DOQ</h1>
          <p className="text-sm sm:text-base text-gray-600">Create your account and start your health journey</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
                <p className="text-xs text-gray-600">Password must be at least 8 characters long</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full pr-10 text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm sm:text-base text-gray-600">
                Already have an account?{" "}
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 