"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, Save, Calendar, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    medications: "",
    medicalConditions: "",
    healthGoals: "",
  })

  // Fetch user and health profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        console.log('No user ID available, skipping profile fetch')
        setProfileLoading(false)
        return
      }

      try {
        setProfileLoading(true)
        console.log('Fetching profile for user ID:', user.id)
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        // Fetch health profile data
        const { data: healthData, error: healthError } = await supabase
          .from('health_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (userError) {
          console.error('Error fetching user profile:', userError)
          toast({
            title: "Error",
            description: `Failed to load profile data: ${userError.message}`,
            variant: "destructive",
          })
        } else {
          setProfile((prev) => ({
            ...prev,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.date_of_birth || "",
            gender: userData.gender || "",
            address: userData.address || "",
            emergencyContact: userData.emergency_contact || "",
          }))
        }
        // Only log health profile error if it's not a 'no rows' error
        if (healthError && healthError.code !== 'PGRST116' && !/no rows returned/i.test(healthError.message || '')) {
          console.error('Error fetching health profile:', healthError)
        } else if (healthData) {
          setProfile((prev) => ({
            ...prev,
            allergies: Array.isArray(healthData.allergies) ? healthData.allergies.join(", ") : healthData.allergies || "",
            medications: Array.isArray(healthData.medications) ? healthData.medications.join(", ") : healthData.medications || "",
            medicalConditions: Array.isArray(healthData.conditions) ? healthData.conditions.join(", ") : healthData.conditions || "",
            healthGoals: healthData.health_goals || "",
          }))
        }
      } catch (error) {
        console.error('Exception fetching user profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setProfileLoading(false)
      }
    }

    if (user?.id) {
      fetchUserProfile()
    } else {
      setProfileLoading(false)
    }
  }, [user?.id, toast])

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          emergency_contact: profile.emergencyContact,
        })
        .eq('id', user?.id)

      // Upsert health profile
      const { error: healthError } = await supabase
        .from('health_profiles')
        .upsert({
          user_id: user?.id,
          allergies: profile.allergies ? profile.allergies.split(/,\s*/) : [],
          medications: profile.medications ? profile.medications.split(/,\s*/) : [],
          conditions: profile.medicalConditions ? profile.medicalConditions.split(/,\s*/) : [],
          health_goals: profile.healthGoals,
        }, { onConflict: 'user_id' })

      if (userError || healthError) {
        console.error('Error updating profile:', userError, healthError)
        if (userError) console.error('User update error details:', userError)
        if (healthError) console.error('Health profile update error details:', healthError)
        toast({
          title: "Error",
          description: `Failed to update profile. ${userError?.message || ''} ${healthError?.message || ''}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      }
    } catch (error) {
      console.error('Exception updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-8 h-8" />
            User Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and health preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={profile.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-10"
                      value={profile.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profile.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
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
                    className="pl-10"
                    value={profile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Name - Phone Number"
                  value={profile.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>Manage your health preferences and medical history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies (e.g., medications, foods, environmental)"
                  value={profile.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List your current medications and dosages"
                  value={profile.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="List any medical conditions or diagnoses"
                  value={profile.medicalConditions}
                  onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthGoals">Health Goals</Label>
                <Textarea
                  id="healthGoals"
                  placeholder="Describe your health and wellness goals"
                  value={profile.healthGoals}
                  onChange={(e) => handleInputChange("healthGoals", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
