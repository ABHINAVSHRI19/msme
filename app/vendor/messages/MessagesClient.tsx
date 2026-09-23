'use client'

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, User2 } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { timeAgo } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  created_at: string
  sender_role: string
  is_read: boolean
}

interface Conversation {
  id: string
  vendor_id: string
  creator_id: string
  last_message_at?: string
  unread_vendor: number
  unread_creator: number
  creator?: { id: string; name: string; avatar_url?: string; niche?: string } | null
  vendor?: { id: string; business_name: string } | null
  messages?: Message[]
}

interface MessagesClientProps {
  conversations: Conversation[]
  userId: string
  userRole: "vendor" | "creator"
}

export function MessagesClient({ conversations, userId, userRole }: MessagesClientProps) {
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null)
  const [messages, setMessages] = useState<Message[]>(
    conversations.find(c => c.id === activeId)?.messages ?? []
  )
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const active = conversations.find(c => c.id === activeId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const switchConversation = (id: string) => {
    setActiveId(id)
    const conv = conversations.find(c => c.id === id)
    setMessages(conv?.messages ?? [])
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeId) return
    setSending(true)
    const { data } = await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: userId,
      sender_role: userRole,
      content: input.trim(),
    }).select().single()

    if (data) {
      setMessages(prev => [...prev, data])
      setInput("")
      // Update last_message_at
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeId)
    }
    setSending(false)
  }

  const getOtherParty = (conv: Conversation) =>
    userRole === "vendor"
      ? { name: conv.creator?.name ?? "Creator", subtitle: conv.creator?.niche ?? "", avatar: conv.creator?.avatar_url }
      : { name: conv.vendor?.business_name ?? "Vendor", subtitle: "", avatar: null }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Messages</h1>
        <p className="text-sm text-gray-500 mb-5">Your conversations with {userRole === "vendor" ? "creators" : "vendors"}</p>
        <EmptyState icon={MessageSquare} title="No conversations yet" description="Messages will appear here when creators contact you about products." />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="card-base overflow-y-auto">
          {conversations.map(conv => {
            const other = getOtherParty(conv)
            const lastMsg = conv.messages?.slice(-1)[0]
            const isActive = conv.id === activeId
            return (
              <button
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-100 last:border-0 transition-colors",
                  isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    {other.avatar
                      ? <img src={other.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                      : <User2 size={16} className="text-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{other.name}</p>
                    <p className="text-xs text-gray-400 truncate">{lastMsg?.content ?? "No messages yet"}</p>
                  </div>
                  {lastMsg && <p className="text-xs text-gray-400 shrink-0">{timeAgo(lastMsg.created_at)}</p>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 card-base flex flex-col">
          {active && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User2 size={15} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{getOtherParty(active).name}</p>
                  <p className="text-xs text-gray-400">{getOtherParty(active).subtitle}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-gray-400 mt-8">No messages yet. Start the conversation!</p>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_role === userRole
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isMine ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn("text-xs mt-1", isMine ? "text-indigo-200" : "text-gray-400")}>{timeAgo(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
