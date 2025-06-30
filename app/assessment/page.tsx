"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"

interface Question {
  id: string
  type: "text" | "radio" | "checkbox"
  question: string
  options?: string[]
  required: boolean
}

const questions: Question[] = [
  {
    id: "1",
    type: "text",
    question: "Please describe your main symptoms in detail. When did they start?",
    required: true,
  },
  {
    id: "2",
    type: "radio",
    question: "How would you rate your pain level on a scale of 1-10?",
    options: ["1-2 (Mild)", "3-4 (Mild-Moderate)", "5-6 (Moderate)", "7-8 (Severe)", "9-10 (Extreme)"],
    required: true,
  },
  {
    id: "3",
    type: "radio",
    question: "How long have you been experiencing these symptoms?",
    options: ["Less than 24 hours", "1-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks"],
    required: true,
  },
  {
    id: "4",
    type: "radio",
    question: "Have you taken any medication for these symptoms?",
    options: [
      "No medication taken",
      "Over-the-counter pain relievers",
      "Prescription medication",
      "Home remedies only",
    ],
    required: true,
  },
  {
    id: "5",
    type: "text",
    question: "Do you have any other symptoms? Please describe any additional concerns.",
    required: false,
  },
]

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      setIsComplete(true)
      setIsLoading(false)
    }, 3000)
  }

  const canProceed = () => {
    const answer = answers[currentQuestion.id]
    return !currentQuestion.required || (answer && answer.trim().length > 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Symptoms</h3>
              <p className="text-gray-600">
                Our AI is processing your information to provide personalized recommendations...
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              Assessment Complete
            </h1>
            <p className="text-gray-600 mt-2">Based on your symptoms, here are our AI-generated recommendations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgency Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Urgency Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">Moderate</Badge>
                  <p className="text-sm text-gray-600 mt-2">Consider seeing a healthcare provider within 1-2 days</p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Confidence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
                  <Progress value={78} className="mb-2" />
                  <p className="text-sm text-gray-600">Based on symptom analysis</p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600 mb-2">1-2 Days</div>
                  <p className="text-sm text-gray-600">Recommended timeframe for medical consultation</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Personalized advice based on your symptom assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Immediate Care</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Continue monitoring your symptoms</li>
                  <li>• Stay hydrated and get adequate rest</li>
                  <li>• Take over-the-counter pain relief as needed</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Medical Attention</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Schedule an appointment with your primary care physician</li>
                  <li>• Consider urgent care if symptoms worsen</li>
                  <li>• Bring a list of current medications to your appointment</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Seek Emergency Care If:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Symptoms suddenly worsen or become severe</li>
                  <li>• You experience difficulty breathing</li>
                  <li>• You develop chest pain or severe headache</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-yellow-800">
                    This assessment is for informational purposes only and does not replace professional medical advice.
                    Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button onClick={() => (window.location.href = "/providers")}>Find Healthcare Providers</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/chat")}>
              Chat with AI Doctor
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Take Another Assessment
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            AI Symptom Assessment
          </h1>
          <p className="text-gray-600 mt-2">Answer a few questions to get personalized health recommendations</p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {currentStep + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle>Question {currentStep + 1}</CardTitle>
            <CardDescription>{currentQuestion.question}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "text" && (
              <Textarea
                placeholder="Please provide as much detail as possible..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={4}
              />
            )}

            {currentQuestion.type === "radio" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={!canProceed()}>
                {currentStep === questions.length - 1 ? "Complete Assessment" : "Next"}
                {currentStep < questions.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
