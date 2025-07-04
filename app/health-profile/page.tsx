"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Heart, Pill, AlertTriangle, Activity, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { supabase } from "@/lib/supabase"
import ReactMarkdown from "react-markdown"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribedBy: string
  startDate: string
}

interface Allergy {
  id: string
  name: string
  severity: "mild" | "moderate" | "severe"
  reaction: string
  dateIdentified: string
}

interface Condition {
  id: string
  name: string
  diagnosedDate: string
  status: "active" | "resolved" | "managed"
  notes: string
}

export default function HealthProfilePage() {
  const { toast } = useToast()
  const [isAddingMedication, setIsAddingMedication] = useState(false)
  const [isAddingAllergy, setIsAddingAllergy] = useState(false)
  const [isAddingCondition, setIsAddingCondition] = useState(false)

  const [profile, setProfile] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id)
        supabase
          .from("health_profiles")
          .select("last_assessment, recent_symptoms, ai_recommendations, medications, allergies, conditions")
          .eq("user_id", data.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data)
          })
        supabase
          .from("assessments")
          .select("id, created_at, symptoms, recommendations")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => setAssessments(data || []))
      }
    })
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-100 text-yellow-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800"
      case "managed":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateHealthProfileField = async (field: string, value: any) => {
    if (!userId) return
    const { error } = await supabase
      .from("health_profiles")
      .update({ [field]: value })
      .eq("user_id", userId)
    if (!error) {
      supabase
        .from("health_profiles")
        .select("medications, allergies, conditions")
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          setProfile(data)
        })
    }
    return error
  }

  const handleDeleteMedication = async (id: string) => {
    const updated = profile?.medications.filter((med: any) => med.id !== id) || []
    setProfile((prev: any) => ({ ...prev, medications: updated }))
    await updateHealthProfileField("medications", updated)
    toast({
      title: "Medication Removed",
      description: "The medication has been removed from your profile.",
    })
  }

  const handleDeleteAllergy = async (id: string) => {
    const updated = profile?.allergies.filter((allergy: any) => allergy.id !== id) || []
    setProfile((prev: any) => ({ ...prev, allergies: updated }))
    await updateHealthProfileField("allergies", updated)
    toast({
      title: "Allergy Removed",
      description: "The allergy has been removed from your profile.",
    })
  }

  const handleDeleteCondition = async (id: string) => {
    const updated = profile?.conditions.filter((condition: any) => condition.id !== id) || []
    setProfile((prev: any) => ({ ...prev, conditions: updated }))
    await updateHealthProfileField("conditions", updated)
    toast({
      title: "Condition Removed",
      description: "The condition has been removed from your profile.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
            Health Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your medications, allergies, and medical conditions</p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Assessment History</h2>
          <p className="text-sm sm:text-base text-gray-600">All your past AI-powered health assessments</p>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {assessments.length === 0 && (
            <Card>
              <CardContent className="py-6 sm:py-8 text-center text-gray-500">
                No assessments found.
              </CardContent>
            </Card>
          )}
          {assessments.map((a) => (
            <Card key={a.id} className="border-blue-200">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> Assessment on {a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}
                </CardTitle>
                <CardDescription className="text-sm">
                  <span className="font-semibold">Symptoms:</span> {a.symptoms || "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <span className="font-semibold flex items-center gap-1 text-sm sm:text-base">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> AI Recommendations:
                  </span>
                  <div className="bg-gray-50 rounded p-2 sm:p-3 mt-1 text-xs sm:text-sm max-h-48 sm:max-h-64 overflow-auto border">
                    {a.recommendations ? (
                      <ReactMarkdown>{a.recommendations}</ReactMarkdown>
                    ) : (
                      "No recommendations available."
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
