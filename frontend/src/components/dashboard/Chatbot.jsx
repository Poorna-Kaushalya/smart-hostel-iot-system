import { useState } from "react";
import axios from "axios";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";

export default function Chatbot({ latestData, allRoomsData }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Ask me about temperature, humidity, air quality, occupancy, or power usage.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const askChatbot = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: currentQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      if (!latestData) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Live Firebase dashboard data is still loading. Please try again.",
          },
        ]);
        return;
      }

      const res = await axios.post("http://localhost:5000/api/chatbot/chat", {
        message: currentQuestion,
        dashboardData: latestData,
        roomsData: allRoomsData,
        history: messages.slice(-5)
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply || "No answer received.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot frontend error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I could not read the live dashboard data right now. Please check if backend is running on port 5000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-700 px-5 py-4 text-white shadow-xl hover:bg-blue-800"
        >
          <FaRobot />
          AI Chatbot
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between rounded-t-2xl bg-blue-800 px-4 py-3 text-white">
            <div>
              <h2 className="font-bold">Smart Hostel AI Chatbot</h2>
              <p className="text-xs text-blue-100">Live dashboard assistant</p>
            </div>

            <button onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="h-[360px] overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${msg.sender === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-white text-slate-800 border border-slate-200"
                  }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="mr-auto mb-3 max-w-[85%] rounded-xl bg-white px-3 py-2 text-sm text-slate-700 border">
                Thinking...
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-slate-200 p-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") askChatbot();
              }}
              placeholder="Why temperature increased?"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={askChatbot}
              disabled={loading}
              className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}