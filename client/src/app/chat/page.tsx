"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken, getUser } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Conversation, Message } from "@/types";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConvId = searchParams.get("c");
  const user = getUser();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  // Fetch conversations
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<Conversation[]>("/chat/conversations");
        if (res.success) setConversations(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await apiFetch<{ messages: Message[] }>(
          `/chat/conversations/${activeConvId}/messages`
        );
        if (res.success) setMessages(res.data.messages);
      } catch {
        // ignore
      }
    })();
  }, [activeConvId]);

  // Socket.io real-time
  useEffect(() => {
    if (!activeConvId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinConversation", activeConvId);

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConvId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
            : c
        )
      );
    };

    const handleUserTyping = () => setTyping(true);
    const handleUserStoppedTyping = () => setTyping(false);

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.emit("leaveConversation", activeConvId);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [activeConvId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!newMsg.trim() || !activeConvId || sending) return;
    setSending(true);
    try {
      const res = await apiFetch<Message>(
        `/chat/conversations/${activeConvId}/messages`,
        { method: "POST", body: JSON.stringify({ content: newMsg.trim() }) }
      );
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConvId
              ? { ...c, lastMessage: res.data.content, lastMessageAt: res.data.createdAt }
              : c
          )
        );
        setNewMsg("");
        const socket = getSocket();
        if (socket) socket.emit("stopTyping", activeConvId);
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }, [newMsg, activeConvId, sending]);

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !activeConvId) return;
    socket.emit("typing", activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", activeConvId);
    }, 2000);
  };

  const activeConversation = conversations.find((c) => c._id === activeConvId);
  const otherUser = activeConversation?.participants.find(
    (p) => p._id !== user?._id
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center text-muted">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="flex h-[calc(100vh-200px)] rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {/* Conversation list sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-80" : "w-0"
          } border-r border-border shrink-0 overflow-hidden transition-all flex flex-col`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm text-muted">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                No conversations yet.
                <br />
                <Link href="/properties" className="text-primary hover:underline mt-2 inline-block">
                  Browse properties
                </Link>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.participants.find(
                  (p) => p._id !== user?._id
                );
                const isActive = conv._id === activeConvId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      router.push(`/chat?c=${conv._id}`);
                      setSidebarOpen(window.innerWidth >= 768);
                    }}
                    className={`w-full text-left p-4 border-b border-border hover:bg-gray-50 transition-colors ${
                      isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground truncate">
                        {other?.email || "Unknown"}
                      </p>
                      <span className="text-xs text-muted shrink-0 ml-2">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-primary mt-1 truncate">
                      {conv.property.title}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted mt-1 truncate">
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Select a conversation to start chatting
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-gray-50/50">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors md:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {otherUser?.email || "Unknown"}
                  </p>
                  <Link
                    href={`/properties/${activeConversation?.property._id}`}
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    {activeConversation?.property.title} — $
                    {activeConversation?.property.price.toLocaleString()}
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted py-8">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender._id === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-gray-100 text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? "text-white/60" : "text-muted"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    value={newMsg}
                    onChange={(e) => {
                      setNewMsg(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || sending}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
