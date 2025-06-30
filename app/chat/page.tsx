"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import { useAuth } from "@/lib/auth"

// AI Health Chat page - main chat interface for users to interact with the AI assistant

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
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage, userId: user?.id }),
      })

      if (!response.ok) throw new Error('Chat failed')
      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence,
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I apologize, but I'm unable to process your request at the moment. Please try again or consult a healthcare provider.",
        timestamp: new Date(),
        confidence: 50,
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 flex justify-center items-start py-4 px-2">
        <div className="flex w-full max-w-7xl bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-4rem)]">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col border-r">
            {/* Header */}
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5" />
                AI Doctor Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about symptoms, medications, and health topics
              </CardDescription>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => {
                const isError = message.type === "ai" && message.content.startsWith("I apologize")

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"} mb-2`}
                  >
                    {/* Left icon for AI */}
                    {message.type === "ai" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-auto">
                        {isError ? <AlertCircle className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        message.type === "user"
                          ? "bg-blue-600 text-white text-right"
                          : isError
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <div
                        className={`text-xs opacity-60 mt-2 flex gap-2 ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.type === "ai" && message.confidence && !isError && (
                          <Badge variant="secondary">{message.confidence}% confidence</Badge>
                        )}
                      </div>
                    </div>

                    {/* Right icon for User */}
                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mt-auto">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input box */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about symptoms, medications, or health concerns..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isTyping}
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-80 flex-shrink-0 overflow-y-auto bg-gray-50 p-4 space-y-6">
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
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-red-900 mb-2">Emergency?</h4>
                <p className="text-sm text-red-800 mb-3">
                  For medical emergencies, call emergency services immediately.
                </p>
                <Button variant="destructive" size="sm" className="w-full">
                  Call 911
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}