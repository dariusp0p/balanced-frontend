import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Send, UserPlus, Users } from "lucide-react";

import { BottomNav } from "../../dashboard/views/components/BottomNav";
import {
  fetchConversation,
  fetchUsers,
  sendChatMessage,
} from "../services/FriendsRepository";
import {
  connectChatRealtime,
  disconnectChatRealtime,
} from "../services/ChatRealtime";
import type { AppUser, ChatMessage } from "../types/chat";

function currentUserId() {
  const value = Number(localStorage.getItem("userId"));
  return Number.isFinite(value) ? value : null;
}

function createTempId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function FriendsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const me = currentUserId();

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    connectChatRealtime(me, (message) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;

        const isActiveThread =
          selectedUser &&
          (message.senderId === selectedUser.id ||
            message.receiverId === selectedUser.id);

        if (!isActiveThread) return current;

        const optimisticIndex = current.findIndex(
          (item) =>
            item.status === "sending" &&
            item.senderId === message.senderId &&
            item.receiverId === message.receiverId &&
            item.content === message.content,
        );

        if (optimisticIndex !== -1) {
          const updated = [...current];
          updated[optimisticIndex] = { ...message, status: "sent" };
          return updated;
        }

        return [...current, { ...message, status: "sent" }];
      });
    });

    return () => disconnectChatRealtime();
  }, [me, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    fetchConversation(selectedUser.id).then(setMessages);
  }, [selectedUser]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const title = selectedUser ? selectedUser.name : "Friends";
  const initials = useMemo(
    () =>
      title
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [title],
  );

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUser) return;
    if (!me) return;

    const content = draft.trim();
    if (!content) return;

    const tempId = createTempId();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: me,
      senderName: "",
      receiverId: selectedUser.id,
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
      tempId,
    };

    setMessages((current) => [...current, optimisticMessage]);
    setDraft("");

    try {
      await sendChatMessage(selectedUser.id, content);
      // Server will broadcast via realtime; we replace optimistic then.
    } catch {
      setMessages((current) => current.filter((msg) => msg.tempId !== tempId));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-blue px-4 py-4 text-white">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-3">
          {selectedUser ? (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
              aria-label="Back to friends"
              onClick={() => setSelectedUser(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {selectedUser ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan text-dark-blue">
                {initials}
              </div>
            ) : null}
            <h1 className="truncate text-xl font-semibold">{title}</h1>
          </div>
          {!selectedUser ? (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/15"
              aria-label="Add friend"
              title="Add friend"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[480px] flex-col px-4 pb-28 pt-6">
        {!selectedUser ? (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan/10 text-dark-blue">
                  <Users className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold text-dark-blue">
                  No users yet
                </h2>
              </div>
            ) : (
              users.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                    index > 0 ? "border-t border-gray-100" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark-blue text-sm font-semibold text-white">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-dark-blue">
                      {user.name}
                    </div>
                    <div className="truncate text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))
            )}
          </section>
        ) : (
          <section className="flex min-h-[calc(100vh-160px)] flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => {
                const mine = message.senderId === me;
                return (
                  <div
                    key={message.tempId || message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                        mine
                          ? "rounded-br-sm bg-orange text-white"
                          : "rounded-bl-sm bg-gray-100 text-dark-blue"
                      }`}
                    >
                      {message.content}
                      {mine && message.status === "sending" ? (
                        <span className="ml-2 text-xs text-white/70">
                          sending…
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>
            <form
              className="flex items-center gap-2 border-t border-gray-100 p-3"
              onSubmit={handleSend}
            >
              <input
                className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-cyan"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-blue text-white"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        )}
      </main>

      <BottomNav navigate={navigate} currentPath={location.pathname} />
    </div>
  );
}
