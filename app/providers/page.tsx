"use client"

import { useState } from "react"
import { Search, MapPin, Star, Filter, Phone, Calendar, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"

interface Provider {
  id: string
  name: string
  specialty: string
  rating: number
  reviewCount: number
  distance: string
  address: string
  phone: string
  image: string
  acceptsInsurance: boolean
  nextAvailable: string
  languages: string[]
  education: string
  experience: string
}

const providers: Provider[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Family Medicine",
    rating: 4.8,
    reviewCount: 127,
    distance: "0.8 miles",
    address: "123 Medical Center Dr, Suite 200",
    phone: "(555) 123-4567",
    image: "/placeholder.svg?height=80&width=80",
    acceptsInsurance: true,
    nextAvailable: "Tomorrow at 2:00 PM",
    languages: ["English", "Spanish"],
    education: "MD from Johns Hopkins University",
    experience: "12 years",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    rating: 4.9,
    reviewCount: 89,
    distance: "1.2 miles",
    address: "456 Heart Health Blvd, Floor 3",
    phone: "(555) 234-5678",
    image: "/placeholder.svg?height=80&width=80",
    acceptsInsurance: true,
    nextAvailable: "Friday at 10:30 AM",
    languages: ["English", "Mandarin"],
    education: "MD from Stanford University",
    experience: "15 years",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    rating: 4.7,
    reviewCount: 156,
    distance: "2.1 miles",
    address: "789 Skin Care Ave, Suite 101",
    phone: "(555) 345-6789",
    image: "/placeholder.svg?height=80&width=80",
    acceptsInsurance: false,
    nextAvailable: "Next week Tuesday",
    languages: ["English", "Spanish", "Portuguese"],
    education: "MD from Harvard Medical School",
    experience: "8 years",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    rating: 4.6,
    reviewCount: 203,
    distance: "3.5 miles",
    address: "321 Bone & Joint Center",
    phone: "(555) 456-7890",
    image: "/placeholder.svg?height=80&width=80",
    acceptsInsurance: true,
    nextAvailable: "Next Monday at 9:00 AM",
    languages: ["English"],
    education: "MD from Mayo Clinic",
    experience: "20 years",
  },
]

export default function ProvidersPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedInsurance, setSelectedInsurance] = useState("")
  const [filteredProviders, setFilteredProviders] = useState(providers)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const specialties = [
    "Family Medicine",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Neurology",
    "Oncology",
  ]

  const handleSearch = () => {
    let filtered = providers

    if (searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((provider) => provider.specialty === selectedSpecialty)
    }

    if (selectedInsurance === "accepted") {
      filtered = filtered.filter((provider) => provider.acceptsInsurance)
    }

    setFilteredProviders(filtered)
  }

  const handleBookAppointment = (provider: Provider) => {
    toast({
      title: "Booking Request Sent",
      description: `Your appointment request with ${provider.name} has been sent. You'll receive a confirmation shortly.`,
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-8 h-8" />
            Find Healthcare Providers
          </h1>
          <p className="text-gray-600 mt-2">Connect with qualified healthcare professionals in your area</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Doctor name or specialty"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance</Label>
                <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                  <SelectTrigger>
                    <SelectValue placeholder="All providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All providers</SelectItem>
                    <SelectItem value="accepted">Accepts my insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={provider.image || "/placeholder.svg"}
                    alt={provider.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{provider.name}</h3>
                        <p className="text-gray-600">{provider.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderStars(provider.rating)}
                          <span className="text-sm font-medium ml-1">{provider.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">({provider.reviewCount} reviews)</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {provider.distance} • {provider.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{provider.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Next available: {provider.nextAvailable}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {provider.acceptsInsurance && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Accepts Insurance
                        </Badge>
                      )}
                      {provider.languages.map((language) => (
                        <Badge key={language} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProvider(provider)}>
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              <img
                                src={provider.image || "/placeholder.svg"}
                                alt={provider.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <div>{provider.name}</div>
                                <div className="text-sm font-normal text-gray-600">{provider.specialty}</div>
                              </div>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Education</h4>
                                <p className="text-sm text-gray-600">{provider.education}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Experience</h4>
                                <p className="text-sm text-gray-600">{provider.experience}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Languages</h4>
                              <div className="flex gap-2">
                                {provider.languages.map((language) => (
                                  <Badge key={language} variant="outline">
                                    {language}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Contact Information</h4>
                              <p className="text-sm text-gray-600 mb-1">{provider.address}</p>
                              <p className="text-sm text-gray-600">{provider.phone}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button size="sm" onClick={() => handleBookAppointment(provider)}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No providers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all available providers.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
