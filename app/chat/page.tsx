"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navigation from "@/components/navigation"
import { useAuth } from "@/lib/auth"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  confidence?: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI health assistant. I can help answer questions about symptoms, medications, and general health topics. How can I assist you today?",
      timestamp: new Date(),
      confidence: 95,
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat failed')
      }

      const data = await response.json()
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence,
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Chat error:', error)
      // Fallback response if API fails
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I apologize, but I'm unable to process your request at the moment. Please try again or consult with a healthcare provider for immediate concerns.",
        timestamp: new Date(),
        confidence: 50,
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("headache") || input.includes("head pain")) {
      return "Headaches can have various causes including tension, dehydration, stress, or underlying conditions. For mild headaches, try resting in a quiet, dark room, staying hydrated, and applying a cold or warm compress. If headaches are severe, frequent, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare provider immediately."
    }

    if (input.includes("fever") || input.includes("temperature")) {
      return "A fever is typically defined as a body temperature above 100.4°F (38°C). It's often a sign that your body is fighting an infection. Stay hydrated, rest, and monitor your temperature. Seek medical attention if fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms like difficulty breathing, chest pain, or severe headache."
    }

    if (input.includes("medication") || input.includes("drug")) {
      return "I can provide general information about medications, but I cannot prescribe or recommend specific dosages. Always consult with your healthcare provider or pharmacist before starting, stopping, or changing any medications. They can review your medical history, current medications, and potential interactions to ensure your safety."
    }

    return "Thank you for your question. While I can provide general health information, it's important to remember that I cannot replace professional medical advice. For specific symptoms or concerns, especially if they're severe or persistent, please consult with a qualified healthcare provider who can properly evaluate your condition and provide personalized treatment recommendations."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8" />
            AI Health Chat
          </h1>
          <p className="text-gray-600 mt-2">Get instant answers to your health questions from our AI assistant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Doctor Assistant
                </CardTitle>
                <CardDescription>Ask questions about symptoms, medications, and health topics</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => {
                      // Detect error/fallback AI message
                      const isError =
                        message.type === "ai" &&
                        message.content.startsWith("I apologize, but I'm unable to process your request")

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 mb-2 ${
                            message.type === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* AI Icon (left) */}
                          {message.type === "ai" && (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-auto">
                              {isError ? (
                                <AlertCircle className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 shadow-sm relative ${
                              message.type === "user"
                                ? "bg-blue-600 text-white text-right"
                                : isError
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                              <span className="text-xs opacity-60 block">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {/* Confidence badge only for valid AI responses */}
                              {message.type === "ai" && message.confidence && !isError && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.confidence}% confidence
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* User Icon (right) */}
                          {message.type === "user" && (
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mt-auto">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about symptoms, medications, or health concerns..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isTyping}
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Common cold symptoms",
                  "Medication interactions",
                  "Fever management",
                  "Headache causes",
                  "Allergic reactions",
                  "First aid basics",
                ].map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => setInputMessage(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 text-sm mb-1">Medical Disclaimer</h4>
                    <p className="text-xs text-yellow-800">
                      This AI assistant provides general health information only. Always consult healthcare
                      professionals for medical advice, diagnosis, or treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-red-900 mb-2">Emergency?</h4>
                  <p className="text-sm text-red-800 mb-3">
                    For medical emergencies, call emergency services immediately.
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    Call 911
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
