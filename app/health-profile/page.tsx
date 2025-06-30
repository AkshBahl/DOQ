"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Heart, Pill, AlertTriangle, Activity } from "lucide-react"
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
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Smith",
      startDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Johnson",
      startDate: "2023-12-01",
    },
  ])

  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: "1",
      name: "Penicillin",
      severity: "severe",
      reaction: "Anaphylaxis",
      dateIdentified: "2020-03-15",
    },
    {
      id: "2",
      name: "Shellfish",
      severity: "moderate",
      reaction: "Hives and swelling",
      dateIdentified: "2019-07-22",
    },
  ])

  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "1",
      name: "Hypertension",
      diagnosedDate: "2023-11-10",
      status: "managed",
      notes: "Well controlled with medication",
    },
    {
      id: "2",
      name: "Type 2 Diabetes",
      diagnosedDate: "2023-12-01",
      status: "active",
      notes: "Managing with diet and medication",
    },
  ])

  const [isAddingMedication, setIsAddingMedication] = useState(false)
  const [isAddingAllergy, setIsAddingAllergy] = useState(false)
  const [isAddingCondition, setIsAddingCondition] = useState(false)

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

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id))
    toast({
      title: "Medication Removed",
      description: "The medication has been removed from your profile.",
    })
  }

  const handleDeleteAllergy = (id: string) => {
    setAllergies((prev) => prev.filter((allergy) => allergy.id !== id))
    toast({
      title: "Allergy Removed",
      description: "The allergy has been removed from your profile.",
    })
  }

  const handleDeleteCondition = (id: string) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id))
    toast({
      title: "Condition Removed",
      description: "The condition has been removed from your profile.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-8 h-8" />
            Health Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your medications, allergies, and medical conditions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  <CardTitle>Medications</CardTitle>
                </div>
                <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                      <DialogDescription>Add a new medication to your health profile.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="medName">Medication Name</Label>
                        <Input id="medName" placeholder="Enter medication name" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input id="dosage" placeholder="e.g., 10mg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once-daily">Once daily</SelectItem>
                              <SelectItem value="twice-daily">Twice daily</SelectItem>
                              <SelectItem value="three-times-daily">Three times daily</SelectItem>
                              <SelectItem value="as-needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prescribedBy">Prescribed By</Label>
                        <Input id="prescribedBy" placeholder="Doctor's name" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingMedication(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingMedication(false)}>Add Medication</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Current medications and prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Prescribed by {medication.prescribedBy}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMedication(medication.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <CardTitle>Allergies</CardTitle>
                </div>
                <Dialog open={isAddingAllergy} onOpenChange={setIsAddingAllergy}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Allergy</DialogTitle>
                      <DialogDescription>Add a new allergy to your health profile.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="allergyName">Allergy Name</Label>
                        <Input id="allergyName" placeholder="Enter allergy name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reaction">Reaction</Label>
                        <Textarea id="reaction" placeholder="Describe the allergic reaction" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingAllergy(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingAllergy(false)}>Add Allergy</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Known allergies and sensitivities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergies.map((allergy) => (
                  <div key={allergy.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{allergy.name}</h4>
                          <Badge className={getSeverityColor(allergy.severity)}>{allergy.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{allergy.reaction}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Identified: {new Date(allergy.dateIdentified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteAllergy(allergy.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <CardTitle>Conditions</CardTitle>
                </div>
                <Dialog open={isAddingCondition} onOpenChange={setIsAddingCondition}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medical Condition</DialogTitle>
                      <DialogDescription>Add a new medical condition to your health profile.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="conditionName">Condition Name</Label>
                        <Input id="conditionName" placeholder="Enter condition name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosedDate">Diagnosed Date</Label>
                        <Input id="diagnosedDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="managed">Managed</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" placeholder="Additional notes about the condition" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCondition(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingCondition(false)}>Add Condition</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Medical conditions and diagnoses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditions.map((condition) => (
                  <div key={condition.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{condition.name}</h4>
                          <Badge className={getStatusColor(condition.status)}>{condition.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{condition.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCondition(condition.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
