"use client"

import { useState } from "react"
import { Eye, EyeOff, Heart, ArrowLeft, ArrowRight, User, Mail, Phone, Calendar, MapPin, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from '@/lib/supabase'

interface SignupData {
  // Step 1: Basic Information
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Personal Details
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  
  // Step 3: Health Information
  allergies: string
  currentMedications: string
  medicalConditions: string
  healthGoals: string
  
  // Step 4: Preferences
  subscriptionTier: 'free' | 'premium' | 'family'
  notifications: boolean
  dataSharing: boolean
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { signUp } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    currentMedications: "",
    medicalConditions: "",
    healthGoals: "",
    subscriptionTier: "free",
    notifications: true,
    dataSharing: false,
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof SignupData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
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
        break
      case 2:
        if (!formData.phone || !formData.dateOfBirth || !formData.gender) {
          setError("Please fill in all required fields")
          return false
        }
        break
      case 3:
        // Health information is optional
        break
      case 4:
        // Preferences are optional
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      // First, create the user account with Supabase Auth
      const { data, error: authError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.user) {
        // Call API route to create user profile with all details using service role key
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            profileData: {
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              date_of_birth: formData.dateOfBirth,
              gender: formData.gender,
              address: formData.address,
              emergency_contact: formData.emergencyContact,
              allergies: formData.allergies,
              current_medications: formData.currentMedications,
              medical_conditions: formData.medicalConditions,
              health_goals: formData.healthGoals,
              subscription_tier: formData.subscriptionTier,
              notifications: formData.notifications,
              data_sharing: formData.dataSharing,
            },
          }),
        })

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({}))
          setError(`Profile creation failed: ${errorData.error || 'Unknown error'}`)
          return
        }

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="pl-10"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
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
        <p className="text-xs text-gray-600">Password must be at least 8 characters long</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            className="pl-10"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="dateOfBirth"
              type="date"
              className="pl-10"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="address"
            placeholder="Enter your full address"
            className="pl-10"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          placeholder="Name - Phone Number (e.g., John Doe - +1 555-123-4567)"
          value={formData.emergencyContact}
          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          placeholder="List any allergies (e.g., medications, foods, environmental)"
          value={formData.allergies}
          onChange={(e) => handleInputChange("allergies", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentMedications">Current Medications</Label>
        <Textarea
          id="currentMedications"
          placeholder="List any medications you're currently taking"
          value={formData.currentMedications}
          onChange={(e) => handleInputChange("currentMedications", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalConditions">Medical Conditions</Label>
        <Textarea
          id="medicalConditions"
          placeholder="List any medical conditions or health issues"
          value={formData.medicalConditions}
          onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="healthGoals">Health Goals</Label>
        <Textarea
          id="healthGoals"
          placeholder="What are your health goals? (e.g., lose weight, manage blood pressure, improve fitness)"
          value={formData.healthGoals}
          onChange={(e) => handleInputChange("healthGoals", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Choose Your Subscription Plan</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'free', name: 'Free', price: '$0', features: ['3 AI consultations per month', 'Basic health tracking', 'Community support'] },
            { id: 'premium', name: 'Premium', price: '$19.99/month', features: ['Unlimited AI consultations', 'Advanced health insights', 'Priority support'] },
            { id: 'family', name: 'Family', price: '$39.99/month', features: ['Up to 6 family members', 'Family health dashboard', 'Shared insights'] }
          ].map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                formData.subscriptionTier === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleInputChange("subscriptionTier", plan.id as any)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-lg font-bold text-blue-600">{plan.price}</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            checked={formData.notifications}
            onChange={(e) => handleInputChange("notifications", e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="notifications">Receive health notifications and reminders</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dataSharing"
            checked={formData.dataSharing}
            onChange={(e) => handleInputChange("dataSharing", e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="dataSharing">Allow data sharing for improved AI recommendations (anonymous)</Label>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Information"
      case 2: return "Personal Details"
      case 3: return "Health Information"
      case 4: return "Preferences & Plan"
      default: return ""
    }
  }

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Create your account with basic information"
      case 2: return "Tell us more about yourself"
      case 3: return "Help us provide better health insights (optional)"
      case 4: return "Choose your plan and preferences"
      default: return ""
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join DOQ</h1>
          <p className="text-gray-600">Create your account and start your health journey</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
                <CardDescription>{getStepTitle(currentStep)}</CardDescription>
              </div>
              <div className="text-sm text-gray-600">{Math.round(progress)}% Complete</div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {renderCurrentStep()}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating Account..."
                  ) : currentStep === totalSteps ? (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
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