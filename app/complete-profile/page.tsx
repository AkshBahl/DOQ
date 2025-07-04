"use client"

import { useState } from "react"
import { Phone, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    currentMedications: "",
    medicalConditions: "",
    healthGoals: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validate = () => {
    if (!formData.phone || !formData.dateOfBirth || !formData.gender || !formData.address || !formData.emergencyContact || !formData.healthGoals) {
      setError("Please fill in all required fields")
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
      // Update users table
      await supabase.from("users").update({
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
      }).eq("id", user?.id)
      // Upsert health profile
      await supabase.from("health_profiles").upsert({
        user_id: user?.id,
        allergies: formData.allergies ? formData.allergies.split(/,\s*/) : [],
        medications: formData.currentMedications ? formData.currentMedications.split(/,\s*/) : [],
        conditions: formData.medicalConditions ? formData.medicalConditions.split(/,\s*/) : [],
        health_goals: formData.healthGoals,
      }, { onConflict: 'user_id' })
      router.push("/choose-subscription")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">Tell us more about yourself to personalize your experience</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Personal & Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Personal Details */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10 w-full text-sm sm:text-base"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm sm:text-base">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10 w-full text-sm sm:text-base"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm sm:text-base">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="w-full text-sm sm:text-base">
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
                  <Label htmlFor="address" className="text-sm sm:text-base">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      className="pl-10 w-full text-sm sm:text-base"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm sm:text-base">Emergency Contact *</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Name - Phone Number (e.g., John Doe - +1 555-123-4567)"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    className="w-full text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              {/* Health Information */}
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm sm:text-base">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any allergies (e.g., medications, foods, environmental)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    rows={3}
                    className="w-full text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications" className="text-sm sm:text-base">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    placeholder="List any medications you're currently taking"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                    rows={3}
                    className="w-full text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions" className="text-sm sm:text-base">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    placeholder="List any medical conditions or health issues"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    rows={3}
                    className="w-full text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthGoals" className="text-sm sm:text-base">Health Goals *</Label>
                  <Textarea
                    id="healthGoals"
                    placeholder="What are your main health goals? (e.g., lose weight, manage stress, improve fitness)"
                    value={formData.healthGoals}
                    onChange={(e) => handleInputChange("healthGoals", e.target.value)}
                    rows={3}
                    className="w-full text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Button type="submit" className="w-full sm:w-auto text-sm sm:text-base" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Complete Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 