"use client"

import type React from "react"

import { useState } from "react"
import { Check, Crown, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  icon: React.ComponentType<any>
  features: string[]
  popular?: boolean
  current?: boolean
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
    current: true,
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

export default function SubscriptionPage() {
  const { toast } = useToast()
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)

    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Subscription Updated",
        description: `You've successfully subscribed to the ${plans.find((p) => p.id === planId)?.name} plan.`,
      })
      setSelectedPlan(null)
    }, 2000)
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Choose Your Health Plan</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            Get the care and insights you need with our flexible subscription options
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className={`text-sm ${!isYearly ? "font-semibold" : "text-gray-600"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? "font-semibold" : "text-gray-600"}`}>Yearly</span>
            {isYearly && <Badge className="bg-green-100 text-green-800 ml-2 text-xs">Save up to 17%</Badge>}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            const price = getPrice(plan)
            const savings = getSavings(plan)

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-blue-500 shadow-lg scale-105"
                    : plan.current
                      ? "border-green-500"
                      : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 sm:px-4 py-1 text-xs">Most Popular</Badge>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 sm:px-4 py-1 text-xs">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                      ${price}
                      {price > 0 && (
                        <span className="text-base sm:text-lg font-normal text-gray-600">/{isYearly ? "year" : "month"}</span>
                      )}
                    </div>
                    {isYearly && savings > 0 && (
                      <p className="text-xs sm:text-sm text-green-600 font-medium">Save ${savings.toFixed(2)} per year</p>
                    )}
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full text-sm sm:text-base"
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={plan.current || selectedPlan === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {selectedPlan === plan.id
                      ? "Processing..."
                      : plan.current
                        ? "Current Plan"
                        : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              Compare all features across our subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Features</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Premium</th>
                    <th className="text-center py-3 px-4">Family</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["AI Consultations", "3/month", "Unlimited", "Unlimited"],
                    ["Symptom Analysis", "Basic", "Advanced", "Advanced"],
                    ["Health Reports", "✗", "✓", "✓"],
                    ["Provider Matching", "Basic", "Priority", "Priority"],
                    ["Family Profiles", "✗", "✗", "Up to 6"],
                    ["24/7 Support", "✗", "✓", "✓"],
                    ["Medication Reminders", "✗", "✓", "✓"],
                    ["Emergency Contacts", "✗", "✗", "✓"],
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{row[0]}</td>
                      <td className="py-3 px-4 text-center">{row[1]}</td>
                      <td className="py-3 px-4 text-center">{row[2]}</td>
                      <td className="py-3 px-4 text-center">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-sm text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-sm text-gray-600">
                  All new users start with our Free plan. You can upgrade to Premium or Family at any time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is my health data secure?</h3>
                <p className="text-sm text-gray-600">
                  Yes, we use enterprise-grade encryption and comply with HIPAA regulations to protect your data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
