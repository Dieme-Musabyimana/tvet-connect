import React, { useState, useEffect, useRef } from "react";
import { useDB } from "../context/InMemoryDB";

export default function GeneralOrgChat() {
  const { currentUser, generalOrgChat, addGeneralMessage, rtbAnnouncements, addRTBAnnouncement } = useDB();
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [replyTo, setReplyTo] = useState(null); 
  const chatDisplayRef = useRef(null);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      addGeneralMessage({
        id: Date.now(),
        sender: currentUser.role === 'school' ? currentUser.details.schoolName : currentUser.details.email,
        text: message,
        timestamp: new Date().toISOString(),
        replyTo: replyTo 
      });
      setMessage("");
      setReplyTo(null);
    }
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (announcement.trim()) {
      addRTBAnnouncement({
        id: Date.now(),
        text: announcement,
        timestamp: new Date().toISOString()
      });
      setAnnouncement("");
    }
  };

  const isRTB = currentUser?.role === "rtb";

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [generalOrgChat]);

  return (
    <div className="chat-container">
      <div className="chat-display" ref={chatDisplayRef}>
        {generalOrgChat.map(msg => (
          <div key={msg.id} className="chat-message">
            {msg.replyTo && (
              <div className="reply-quote">
                <strong>Replying to {msg.replyTo.sender}:</strong>
                <p>{msg.replyTo.text}</p>
              </div>
            )}
            <div className="message-content">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
            <button onClick={() => setReplyTo(msg)} className="reply-button">Reply</button>
          </div>
        ))}
        {rtbAnnouncements.map(ann => (
          <div key={ann.id} className="chat-announcement">
            <strong>RTB Announcement:</strong> {ann.text}
          </div>
        ))}
      </div>
      {replyTo && (
        <div className="replying-to-bar">
          Replying to {replyTo.sender}: "{replyTo.text.substring(0, 30)}..."
          <button onClick={() => setReplyTo(null)}>X</button>
        </div>
      )}
      <form onSubmit={handleMessageSubmit} className="chat-form">
        <input
          type="text"
          placeholder="Send a general message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isRTB}
        />
        <button type="submit" disabled={isRTB}>Send</button>
      </form>
      {isRTB && (
        <form onSubmit={handleAnnouncementSubmit} className="announcement-form">
          <input
            type="text"
            placeholder="Post a new announcement..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
          <button type="submit">Post Announcement</button>
        </form>
      )}
    </div>
  );
}
