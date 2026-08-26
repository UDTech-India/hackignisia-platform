"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

export type Notification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && !error) {
      setNotifications(data);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
      
    if (!error) {
      setNotifications(current =>
        current.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    }
  };
  
  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);
      
    if (!error) {
      setNotifications(current =>
        current.map(n => ({ ...n, is_read: true }))
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            // Optional: Mark all as read when opening
            // markAllAsRead();
          }
        }}
        className="relative rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-zinc-500 transition hover:text-white"
      >
        <Bell size={18} />
        
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-2 shadow-2xl z-50">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-violet-400 hover:text-violet-300 transition"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="mt-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                You have no notifications.
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`w-full text-left rounded-xl p-3 transition ${
                      notification.is_read 
                        ? "bg-transparent text-zinc-500 hover:bg-white/[0.02]" 
                        : "bg-violet-400/[0.04] border border-violet-400/10 text-zinc-300 hover:bg-violet-400/[0.08]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${notification.is_read ? 'bg-transparent' : 'bg-violet-400'}`} />
                      </div>
                      <div>
                        <p className="text-xs leading-5">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-600">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
