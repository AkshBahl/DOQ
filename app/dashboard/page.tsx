"use client"

import { useState, useEffect } from "react"
import { Heart, User, MessageSquare, Stethoscope, Activity, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Navigation from "@/components/navigation"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact?: string
  subscription_tier: string
  health_score?: number
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Check authentication on component mount
  useEffect(() => {
    console.log('Dashboard - Auth state:', { user, session, loading })
    
    if (!loading && !user) {
      console.log('No user found, redirecting to login')
      router.push('/')
    }
  }, [user, session, loading, router])

  // Fetch user profile data when user is authenticated
  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (!user?.id) return

      try {
        setProfileLoading(true)
        console.log('Fetching profile for user ID:', user.id)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') { // no rows returned
          // Insert a new profile row for this user
          console.log('No user profile found, inserting new profile row...')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              subscription_tier: 'free',
              health_score: 0,
            })
          if (insertError) {
            console.error('Error inserting user profile:', insertError)
          } else {
            // Try fetching again
            const { data: newData, error: newFetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()
            if (!newFetchError) {
              setUserProfile(newData)
            }
          }
        } else if (data) {
          setUserProfile(data)
        } else if (error) {
          console.error('Error fetching user profile:', error)
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
        }
      } catch (error) {
        console.error('Exception fetching user profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    if (user?.id) {
      fetchOrCreateUserProfile()
    }
  }, [user?.id])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access the dashboard</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "AI Health Assessment",
      description: "Get personalized health insights",
      icon: Activity,
      href: "/assessment",
      color: "bg-blue-500",
    },
    {
      title: "Chat with AI",
      description: "Ask health questions anytime",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-green-500",
    },
    {
      title: "Find Providers",
      description: "Connect with healthcare professionals",
      icon: Stethoscope,
      href: "/providers",
      color: "bg-purple-500",
    },
    {
      title: "Health Profile",
      description: "Manage your health information",
      icon: Heart,
      href: "/health-profile",
      color: "bg-red-500",
    },
  ]

  const recentActivity = [
    { type: "assessment", message: "Completed symptom assessment", time: "2 hours ago" },
    { type: "chat", message: "Asked about medication interactions", time: "1 day ago" },
    { type: "appointment", message: "Scheduled appointment with Dr. Smith", time: "3 days ago" },
  ]

  // Get user display name
  const getUserName = () => {
    if (userProfile) {
      return `${userProfile.first_name || 'User'} ${userProfile.last_name || ''}`.trim() || 'User'
    }
    return user.user_metadata?.first_name || user.email || 'User'
  }

  // Get user email
  const getUserEmail = () => {
    return userProfile?.email || user.email || 'user@email.com'
  }

  // Get subscription tier
  const getSubscriptionTier = () => {
    return userProfile?.subscription_tier || 'Free'
  }

  // Get health score
  const getHealthScore = () => {
    return userProfile?.health_score || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {getUserName()}!</h1>
          <p className="text-gray-600 mt-2">Here's your health dashboard overview</p>
          {/* Debug info - remove in production */}
          <div className="mt-2 text-xs text-gray-500">
            User ID: {user.id} | Email: {getUserEmail()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/placeholder.svg" alt="Profile" className="w-12 h-12 rounded-full" />
                      <div>
                        <h3 className="font-semibold">{getUserName()}</h3>
                        <p className="text-sm text-gray-600">{getUserEmail()}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscription</span>
                        <Badge variant="secondary">{getSubscriptionTier()}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Health Score</span>
                        <span className="font-semibold text-green-600">{getHealthScore()}/100</span>
                      </div>
                      <Progress value={getHealthScore()} className="h-2" />
                      {userProfile && (
                        <>
                          {userProfile.phone && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Phone</span>
                              <span className="text-sm text-gray-600">{userProfile.phone}</span>
                            </div>
                          )}
                          {userProfile.gender && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Gender</span>
                              <span className="text-sm text-gray-600 capitalize">{userProfile.gender}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Consultations</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Assessments</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Provider Matches</span>
                  <span className="font-semibold">5</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 justify-start bg-transparent"
                      onClick={() => (window.location.href = action.href)}
                    >
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Health Check</p>
                      <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Medication Reminder</p>
                      <p className="text-sm text-gray-600">Daily at 8:00 AM</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
