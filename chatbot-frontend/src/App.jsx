import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css'; // Import the CSS file

const socket = io('http://localhost:3001');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const userMessageObj = { sender: 'user', text: userMessage.trim() };
    setMessages((prev) => [...prev, userMessageObj]);
    socket.emit('send_message', userMessageObj);

    try {
      const response = await axios.post('http://localhost:3001/message', {
        userMessage: userMessage.trim(),
      });

      const botMessageObj = { sender: 'bot', text: response.data.response };
      setMessages((prev) => [...prev, botMessageObj]);
      socket.emit('send_message', botMessageObj);
    } catch (error) {
      console.error('Error fetching bot response:', error);
    }

    setUserMessage('');
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => {
        if (!prev.some((msg) => msg.text === data.text && msg.sender === data.sender)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chatbot</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
          >
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message"
          className="input-field"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
