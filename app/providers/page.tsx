"use client"

import { useState, useEffect } from "react"
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
  const [clinics, setClinics] = useState<any[]>([])
  const [loadingClinics, setLoadingClinics] = useState(false)
  const [locationError, setLocationError] = useState("")

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

  // Fetch clinics from OpenStreetMap Overpass API
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      return
    }
    setLoadingClinics(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const radius = 5000 // meters
        const query = `
          [out:json];
          (
            node["amenity"="clinic"](around:${radius},${latitude},${longitude});
            node["amenity"="doctors"](around:${radius},${latitude},${longitude});
            node["amenity"="hospital"](around:${radius},${latitude},${longitude});
            node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
          );
          out;
        `
        try {
          const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            headers: { "Content-Type": "text/plain" },
          })
          const data = await response.json()
          setClinics(data.elements || [])
        } catch (e) {
          setLocationError("Failed to fetch clinics from OpenStreetMap.")
        } finally {
          setLoadingClinics(false)
        }
      },
      (error) => {
        setLocationError("Unable to retrieve your location.")
        setLoadingClinics(false)
      }
    )
  }, [])

  const handleSearch = () => {
    let filtered = providers

    if (searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty && selectedSpecialty !== "all") {
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

  // Filter clinics by name using the search term (case-insensitive)
  const filteredClinics = clinics.filter(clinic =>
    (clinic.tags?.name || 'Unnamed Clinic').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8" />
            Find Healthcare Providers
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Connect with qualified healthcare professionals in your area</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm sm:text-base"
              />
            </div>
            <div className="hidden">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full text-sm sm:text-base">
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
            <div className="hidden">
              <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Insurance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="accepted">Accepts insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="w-full text-sm sm:text-base">
              <Filter className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{clinic.tags?.name || 'Unnamed Clinic'}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{clinic.tags?.['addr:full'] || clinic.tags?.address || clinic.tags?.['addr:street'] || 'Address not available'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 break-all">Lat: {clinic.lat?.toFixed(4)}, Lon: {clinic.lon?.toFixed(4)}</span>
                </div>
                {clinic.tags?.phone && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{clinic.tags.phone}</span>
                  </div>
                )}
                {clinic.tags?.website && (
                  <a
                    href={clinic.tags.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs sm:text-sm"
                  >
                    Website
                  </a>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  {clinic.tags?.phone && (
                    <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                      <a href={`tel:${clinic.tags.phone}`}><Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />Call</a>
                    </Button>
                  )}
                  {clinic.tags?.website && (
                    <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                      <a href={clinic.tags.website} target="_blank" rel="noopener noreferrer"><Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />Visit Website</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClinics.length === 0 && (
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
