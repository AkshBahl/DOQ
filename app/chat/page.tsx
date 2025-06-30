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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      {/* Compact header bar */}
      <header className="w-full border-b border-gray-100 bg-white py-1 px-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mt-1">
          <Bot className="w-6 h-6" />
          <span className="text-lg font-semibold text-gray-900">AI Health Chat</span>
        </div>
        <span className="text-xs text-gray-500 mt-0.5 mb-1">Get instant answers to your health questions from our AI assistant</span>
      </header>
      {/* ChatGPT-style fixed chat panel */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-2xl mx-auto w-full flex flex-col h-[80vh]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6" ref={scrollAreaRef} style={{scrollBehavior: 'smooth'}}>
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
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-900">
                      <span className="text-sm opacity-70">AI is typing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Input Area */}
            <form
              className="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-3"
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                className="flex-1 rounded-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-0"
                placeholder="Ask about symptoms, medications, or health concerns..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <Button type="submit" className="rounded-full px-4" disabled={!inputMessage.trim() || isTyping}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
