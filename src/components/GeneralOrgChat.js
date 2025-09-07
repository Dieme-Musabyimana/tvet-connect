import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

export default function GeneralOrgChat() {
  const { currentUser, generalOrgChat, rtbAnnouncements, addGeneralMessage, addRTBAnnouncement } = useDB();
  const [message, setMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    addGeneralMessage({
      sender: currentUser.details.schoolName || currentUser.role,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    });
    setMessage("");
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    addRTBAnnouncement({
      sender: "RTB",
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    });
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {rtbAnnouncements.map((announcement, index) => (
          <div key={index} className="announcement-message">
            <p>
              <strong>📢 RTB Announcement:</strong> {announcement.text}
            </p>
            <span className="timestamp">{announcement.timestamp}</span>
          </div>
        ))}
        {generalOrgChat.map((chatMessage, index) => (
          <div key={index} className="chat-message">
            <p>
              <strong>{chatMessage.sender}:</strong> {chatMessage.text}
            </p>
            <span className="timestamp">{chatMessage.timestamp}</span>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={currentUser.role === 'rtb' ? handleSendAnnouncement : handleSendMessage}>
        <input
          type="text"
          placeholder={currentUser.role === 'rtb' ? "Write an announcement..." : "Write a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}