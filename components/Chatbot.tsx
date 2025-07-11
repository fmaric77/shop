'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: any[];
}

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your shopping assistant. I can help you find products, get recommendations, or answer questions about our store. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch products for AI context
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to AI assistant
      const response = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputText,
          products: products.slice(0, 20), // Send subset for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Only include products field if there are recommendations
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || "I'm sorry, I couldn't process your request right now.",
          isUser: false,
          timestamp: new Date(),
          ...(data.recommendedProducts && data.recommendedProducts.length > 0 ? { products: data.recommendedProducts } : {}),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--border-radius-full)'
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="theme-surface rounded-lg shadow-2xl w-80 h-96 flex flex-col border"
          style={{ 
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--border-radius-large)'
          }}
        >
          {/* Header */}
          <div 
            className="text-white p-4 rounded-t-lg flex items-center justify-between"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--border-radius-large) var(--border-radius-large) 0 0'
            }}
          >
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium">Shopping Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white opacity-80 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg`}
                  style={{
                    backgroundColor: message.isUser 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                    color: message.isUser 
                      ? 'white' 
                      : 'var(--color-text)',
                    borderRadius: 'var(--border-radius-medium)'
                  }}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {message.isUser && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      {message.isUser ? (
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        (() => {
                          // Replace product titles in AI text with links
                          let text = message.text;
                          products.forEach(p => {
                            const regex = new RegExp(`\\b${p.title}\\b`, 'g');
                            const url = `/product/${p.slug}`;
                            text = text.replace(regex, `[${p.title}](${url})`);
                          });
                          return (
                            <div 
                              className="prose prose-sm whitespace-pre-wrap"
                              style={{ color: 'var(--color-text)' }}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {text}
                              </ReactMarkdown>
                            </div>
                          );
                        })()
                      )}
                      
                      <p 
                        className="text-xs opacity-70 mt-1"
                        style={{ 
                          color: message.isUser ? 'rgba(255,255,255,0.7)' : 'var(--color-textSecondary)'
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div 
                  className="px-3 py-2 rounded-lg flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--border-radius-medium)'
                  }}
                >
                  <Bot className="h-4 w-4" />
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="border-t p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about products..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 theme-input"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-medium)',
                  '--tw-ring-color': 'var(--color-primary)'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--border-radius-medium)'
                }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
