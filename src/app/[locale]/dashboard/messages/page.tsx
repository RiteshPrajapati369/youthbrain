'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Archive, Trash2, Clock, Globe, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { ContactMessage } from '@/types';

interface MessagesPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardMessagesPage({ params: { locale } }: MessagesPageProps) {
  const isNe = locale === 'ne';
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.messages?.length > 0 && !selectedMessage) {
          setSelectedMessage(data.messages[0]);
        }
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleStatusChange = async (id: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/messages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success(isNe ? 'स्थिति परिवर्तन भयो।' : `Marked as ${status}.`);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
        }
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isNe ? 'के तपाईं यो सन्देश हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this inquiry?')) {
      return;
    }

    try {
      const res = await fetch(`/${locale}/api/dashboard/messages?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(isNe ? 'सन्देश हटाइयो।' : 'Message deleted.');
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch {
      toast.error('Error deleting');
    }
  };

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'सम्पर्क सन्देश तथा सोधपुछ' : 'Contact Inquiries & Tips'}
        subtitle={isNe ? 'पाठक, पत्रकार र विज्ञापनदाताहरूबाट प्राप्त प्रत्यक्ष सन्देशहरू' : 'Direct feedback and editorial inquiries received from the contact desk'}
        locale={locale}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List Column */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-border shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-border bg-surface-2/50 font-bold text-xs uppercase tracking-wider text-text-3">
            {isNe ? `सन्देशहरू (${messages.length})` : `Inquiries (${messages.length})`}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-xs text-text-3">
                {isNe ? 'लोड हुँदैछ...' : 'Loading messages...'}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-3">
                {isNe ? 'कुनै सन्देश छैन।' : 'No messages in inbox.'}
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === 'new') {
                        handleStatusChange(msg.id, 'read');
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-bg-soft'
                        : 'hover:bg-surface-2/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-text-1 truncate max-w-[180px]">
                        {msg.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          msg.status === 'new'
                            ? 'bg-accent-2/15 text-accent-2'
                            : msg.status === 'read'
                            ? 'bg-accent/15 text-accent'
                            : msg.status === 'replied'
                            ? 'bg-accent-3/15 text-accent-3'
                            : 'bg-text-3/15 text-text-3'
                        }`}
                      >
                        {msg.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-text-2 truncate mb-1">
                      {msg.subject}
                    </h4>

                    <p className="text-[11px] text-text-3 line-clamp-1">
                      {msg.message}
                    </p>

                    <div className="mt-2 text-[10px] text-text-3 flex items-center justify-between">
                      <span suppressHydrationWarning>{new Date(msg.created_at).toLocaleDateString()}</span>
                      <span className="font-mono">{msg.ip_address}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Details Column */}
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-border shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
          {selectedMessage ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-border gap-3">
                <div>
                  <h3 className="text-xl font-bold text-text-1">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-3 mt-1">
                    <span className="font-semibold text-text-2">{selectedMessage.name}</span>
                    <span>•</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-accent underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    className="px-3 py-1.5 rounded-lg bg-accent-3/15 text-accent-3 text-xs font-bold hover:bg-accent-3/25 flex items-center gap-1"
                    title="Mark Replied"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isNe ? 'उत्तर दिइयो' : 'Replied'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                    className="p-2 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-lg text-text-3 hover:text-accent-2 hover:bg-accent-2/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Meta Info */}
              <div className="p-3 rounded-xl bg-surface-2/60 border border-border mb-6 flex flex-wrap gap-4 text-xs text-text-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Globe className="w-3.5 h-3.5" />
                  IP: {selectedMessage.ip_address || '127.0.0.1'}
                </span>
              </div>

              {/* Message Body */}
              <div className="prose dark:prose-invert max-w-none text-text-1 text-sm sm:text-base whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-bg-primary border border-border">
                {selectedMessage.message}
              </div>

              {/* Direct Reply Button */}
              <div className="mt-8 pt-4 border-t border-border">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: [YouTh Brain News] ${encodeURIComponent(selectedMessage.subject)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  <Reply className="w-4 h-4" />
                  <span>{isNe ? 'इमेलमार्फत सिधै जवाफ पठाउनुहोस्' : 'Reply via Email Client'}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-text-3">
              <Mail className="w-12 h-12 mx-auto opacity-30 mb-2" />
              <p className="text-sm">
                {isNe ? 'विवरण हेर्न कुनै सन्देश छान्नुहोस्।' : 'Select an inquiry from the list to view.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
