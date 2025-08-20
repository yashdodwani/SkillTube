import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';
import { chatService } from '../services/api';

const ChatRoom = () => {
  const { doubtId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const messagesEndRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    // Get extracted text from localStorage when component mounts
    const storedText = localStorage.getItem(`doubt:${doubtId}:text`);
    if (storedText) {
      setExtractedText(storedText);
    }
  }, [doubtId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!doubtId || !userInfo?._id || hasJoined) {
      return;
    }

    const initializeChat = async () => {
      try {
        // Join chat via API only once
        const chatData = await chatService.joinChat(doubtId, userInfo._id, userInfo.role);
        
        // Set messages from chat history
        setMessages(chatData.messages);
        
        // Set extracted text from server response or localStorage
        const storedText = localStorage.getItem(`doubt:${doubtId}:text`);
        setExtractedText(chatData.extractedText || storedText || '');
        
        // If we got text from server but not in localStorage, store it
        if (chatData.extractedText && !storedText) {
          localStorage.setItem(`doubt:${doubtId}:text`, chatData.extractedText);
        }

        // Join socket room only once
        socket.emit('join_chat', {
          doubtId,
          userId: userInfo._id,
          role: userInfo.role
        });

        scrollToBottom();
        setIsConnected(true);
        setHasJoined(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError(error.message || 'Failed to join chat');
      }
    };

    initializeChat();

    // Clean up function
    return () => {
      if (socket.connected) {
        socket.emit('leave_chat', { doubtId, userId: userInfo._id });
      }
    };
  }, [doubtId, userInfo, hasJoined]);

  // Separate useEffect for socket event listeners
  useEffect(() => {
    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('error', (error) => {
      setError(error.message);
    });

    return () => {
      socket.off('chat_message');
      socket.off('error');
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(doubtId, userInfo._id, newMessage);
      socket.emit('chat_message', {
        doubtId,
        sender: userInfo._id,
        message: newMessage
      });
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Extracted Text Section */}
        {extractedText && (
          <div className="mb-8 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
            <h3 className="text-[#00FF9D] mb-2">Question Text</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{extractedText}</p>
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-8">
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          
          <div className="h-[60vh] overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.sender === userInfo._id ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === userInfo._id
                      ? 'bg-[#00FF9D]/10 text-[#00FF9D]'
                      : 'bg-white/10'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00FF9D]"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#00FF9D] text-black rounded-lg hover:bg-[#00FF9D]/90"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
