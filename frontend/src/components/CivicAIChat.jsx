import { useState } from "react";

function CivicAIChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! 👋 I’m CivicAI. How can I help you with your civic grievance?",
    },
  ]);

  const [input, setInput] = useState("");

  // -----------------------------------------
  // CIVICAI LOCAL INTELLIGENCE
  // -----------------------------------------
  const getAIResponse = (message) => {
    const text = message.toLowerCase();

    // Roads & Potholes
    if (
      text.includes("pothole") ||
      text.includes("road") ||
      text.includes("street damage") ||
      text.includes("damaged road")
    ) {
      return (
        "This appears to be a Roads & Potholes grievance. " +
        "Please provide the exact location of the pothole or damaged road. " +
        "You can then submit the grievance through the portal, where it will be routed to the Road Department."
      );
    }

    // Water Supply
    if (
      text.includes("water") ||
      text.includes("pipeline") ||
      text.includes("leakage") ||
      text.includes("water supply")
    ) {
      return (
        "This appears to be a Water Supply grievance. " +
        "Please provide the location and describe the water problem. " +
        "The grievance can be routed to the Water Department."
      );
    }

    // Waste Management
    if (
      text.includes("garbage") ||
      text.includes("waste") ||
      text.includes("trash") ||
      text.includes("dustbin") ||
      text.includes("cleaning")
    ) {
      return (
        "This appears to be a Waste Management grievance. " +
        "Please provide the location of the garbage or waste accumulation. " +
        "The issue can be routed to the Municipal Corporation."
      );
    }

    // Electricity
    if (
      text.includes("electricity") ||
      text.includes("power") ||
      text.includes("electric") ||
      text.includes("street light")
    ) {
      return (
        "This appears to be an Electricity grievance. " +
        "Please provide the location and describe the electrical problem. " +
        "The issue can be routed to the Electricity Department."
      );
    }

    // Drainage
    if (
      text.includes("drain") ||
      text.includes("drainage") ||
      text.includes("sewage") ||
      text.includes("sewer")
    ) {
      return (
        "This appears to be a Drainage grievance. " +
        "Please provide the exact location and describe the drainage problem. " +
        "The issue can be routed to the Municipal Corporation."
      );
    }

    // Public Safety
    if (
      text.includes("danger") ||
      text.includes("accident") ||
      text.includes("unsafe") ||
      text.includes("emergency") ||
      text.includes("safety")
    ) {
      return (
        "This may be a Public Safety grievance. " +
        "If there is an immediate danger or emergency, please contact the appropriate emergency service. " +
        "For a civic safety issue, provide the location and details so it can be reported."
      );
    }

    // Greeting
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey" ||
      text.includes("good morning") ||
      text.includes("good evening")
    ) {
      return (
        "Hello! 👋 I’m CivicAI. I can help you identify your civic grievance category, " +
        "understand the reporting process, and guide you toward submitting your complaint."
      );
    }

    // Tracking
    if (
      text.includes("track") ||
      text.includes("status") ||
      text.includes("grievance id") ||
      text.includes("complaint status")
    ) {
      return (
        "You can track your grievance using the Track Grievance page. " +
        "Enter your Grievance ID to check its current status, department, priority, and resolution."
      );
    }

    // Submit grievance
    if (
      text.includes("submit") ||
      text.includes("complaint") ||
      text.includes("report an issue") ||
      text.includes("how to report")
    ) {
      return (
        "To report a civic issue, click 'Submit Grievance' in the navigation bar. " +
        "Describe your problem and provide its location. CivicAI will help classify the grievance and identify the appropriate department."
      );
    }

    // Default response
    return (
      "I can help you with civic issues such as roads and potholes, " +
      "water supply, waste management, electricity, drainage, and public safety. " +
      "Please describe your problem and include the location if possible."
    );
  };


  // -----------------------------------------
  // SEND MESSAGE
  // -----------------------------------------
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    const aiResponse = getAIResponse(userMessage);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
      {
        role: "assistant",
        text: aiResponse,
      },
    ]);

    setInput("");
  };


  // -----------------------------------------
  // ENTER KEY
  // -----------------------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  if (!isOpen) {
    return null;
  }


  return (
    <div className="civic-chat-window">

      {/* HEADER */}
      <div className="civic-chat-header">

        <div className="civic-chat-title">

          <div className="civic-chat-avatar">
            AI
          </div>

          <div>
            <strong>CivicAI Assistant</strong>
            <span>Citizen Grievance Support</span>
          </div>

        </div>

        <button
          className="civic-chat-close"
          onClick={onClose}
          aria-label="Close CivicAI"
        >
          ×
        </button>

      </div>


      {/* MESSAGES */}
      <div className="civic-chat-messages">

        {messages.map((message, index) => (
          <div
            key={index}
            className={`ai-message ${message.role}`}
          >
            {message.text}
          </div>
        ))}

      </div>


      {/* INPUT */}
      <div className="civic-chat-input">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask CivicAI..."
          rows="1"
        />

        <button
          onClick={sendMessage}
          aria-label="Send message"
        >
          ➤
        </button>

      </div>

    </div>
  );
}

export default CivicAIChat;