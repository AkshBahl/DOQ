"use client"

import { useState } from "react"
import { Check, Crown, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  icon: React.ComponentType<any>
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic health tracking and limited AI consultations",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    features: [
      "3 AI consultations per month",
      "Basic symptom tracking",
      "Health profile management",
      "Community support",
      "Basic health insights",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Unlimited AI consultations and advanced features",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    icon: Crown,
    features: [
      "Unlimited AI consultations",
      "Advanced symptom analysis",
      "Personalized health recommendations",
      "Priority provider matching",
      "Detailed health reports",
      "Medication reminders",
      "24/7 chat support",
      "Health goal tracking",
    ],
    popular: true,
  },
  {
    id: "family",
    name: "Family",
    description: "Premium features for up to 6 family members",
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    icon: Users,
    features: [
      "Everything in Premium",
      "Up to 6 family member profiles",
      "Family health dashboard",
      "Shared health insights",
      "Family medication tracking",
      "Emergency contact system",
      "Pediatric health support",
      "Family health reports",
    ],
  },
]

export default function ChooseSubscriptionPage() {
  const { toast } = useToast()
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId)
    setIsLoading(true)
    try {
      await supabase.from("users").update({ subscription_tier: planId }).eq("id", user?.id)
      toast({
        title: "Subscription Updated",
        description: `You've successfully subscribed to the ${plans.find((p) => p.id === planId)?.name} plan.`,
      })
      setTimeout(() => {
        router.push("/dashboard")
      }, 1200)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPrice = (plan: Plan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const getSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 0
    const monthlyTotal = plan.monthlyPrice * 12
    const yearlySavings = monthlyTotal - plan.yearlyPrice
    return yearlySavings
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="w-full max-w-3xl">
        {/* Step Indicator */}
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-xs font-semibold mb-2">Step 3 of 3</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Health Plan</h1>
          <p className="text-lg text-gray-600 mb-2">Get the care and insights you need with our flexible subscription options</p>
          <p className="text-sm text-gray-500 mb-6">You can change your plan anytime from your dashboard.</p>
        </div>
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? "font-semibold" : "text-gray-600"}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? "font-semibold" : "text-gray-600"}`}>Yearly</span>
          {isYearly && <Badge className="bg-green-100 text-green-800 ml-2">Save up to 17%</Badge>}
        </div>
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            const price = getPrice(plan)
            const savings = getSavings(plan)
            const isSelected = selectedPlan === plan.id
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 shadow-md hover:shadow-xl border-2 cursor-pointer
                  ${isSelected ? "border-blue-600 bg-blue-50 scale-105" : "border-gray-200 bg-white hover:border-blue-300"}
                `}
                onClick={() => !isLoading && setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-blue-600 rounded-full p-1 z-10">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
                    <IconComponent className={`w-6 h-6 ${isSelected ? "text-blue-600" : "text-blue-400"}`} />
                  </div>
                  <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      ${price}
                      {price > 0 && (
                        <span className="text-lg font-normal text-gray-600">/{isYearly ? "year" : "month"}</span>
                      )}
                    </div>
                    {isYearly && savings > 0 && (
                      <p className="text-sm text-green-600 font-medium">Save ${savings.toFixed(2)} per year</p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full text-base py-3 font-semibold rounded-lg shadow-sm"
                    variant={isSelected ? "default" : "outline"}
                    disabled={isLoading || !isSelected}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isSelected && isLoading
                      ? "Processing..."
                      : isSelected
                        ? "Continue with this Plan"
                        : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
} 