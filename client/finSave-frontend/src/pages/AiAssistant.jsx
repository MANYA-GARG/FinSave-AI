import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hello! I'm your AI finance assistant. Ask me anything about your savings, expenses, or goals!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.get(`/ai/ask?query=${encodeURIComponent(input)}`, {
        withCredentials: true
      });

      const aiReply = res.data?.result || "🤖 Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ I ran into an error while answering." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 px-4 py-10 flex justify-center items-center font-sans">
      <div className="w-full max-w-3xl h-[75vh] bg-white border border-indigo-200 rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-indigo-500 text-white px-6 py-4 rounded-t-2xl font-semibold text-lg shadow-sm">
          💬 AI MoneyMate Assistant
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 text-sm rounded-xl shadow ${
                  msg.sender === "user"
                    ? "bg-yellow-300 text-gray-900 rounded-br-none"
                    : "bg-indigo-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500 italic">Gemini is thinking...</div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleSend}
          className="bg-indigo-50 border-t border-indigo-200 flex p-3 rounded-b-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something like: 'How’s my savings?'"
            className="flex-1 px-4 py-2 text-sm rounded-l-xl bg-white border border-indigo-200 focus:outline-none text-gray-800"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-r-xl text-sm font-medium hover:bg-indigo-500 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
