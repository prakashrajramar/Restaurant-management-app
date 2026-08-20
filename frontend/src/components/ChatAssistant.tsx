import React, { useState } from 'react';
import { api } from '../api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi! I'm Restro AI 🍽️. Ask me anything about using this Restaurant Management App."
    }
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await api.chat(userMessage);

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I cannot connect right now.'
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-white shadow-xl z-50"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">

          <div className="bg-primary text-white p-4 font-bold">
            Restro AI Assistant
          </div>

          <div className="h-80 overflow-y-auto p-3 space-y-3 bg-gray-50">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white border'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-white border p-3 rounded-lg inline-block">
                AI is typing...
              </div>
            )}
          </div>

          <div className="flex border-t">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about this app..."
              className="flex-1 p-3 outline-none"
            />

            <button
              onClick={sendMessage}
              className="px-4 bg-primary text-white"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;