// src/components/Chat.jsx

import React, { useState, useEffect, useRef } from 'react';
import { BiSend, BiPaperclip } from 'react-icons/bi';

const ADMIN_ID = "686f6bad6fb86e69daf078b6"; 

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

function Chat() {
  const [conversations, setConversations] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchAllChats() {
      setIsLoading(true);
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/chat/admin/all');
        const json = await res.json();
        
        if (json.success) {
          const chatMap = {};
          json.data.forEach(msg => {
            if (!msg.senderId || !msg.receiverId) return;
            const user = msg.senderId._id === ADMIN_ID ? msg.receiverId : msg.senderId;
            if (user && user._id) {
              if (!chatMap[user._id]) {
                chatMap[user._id] = { name: user.name || 'Unknown User', messages: [] };
              }
              chatMap[user._id].messages.push(msg);
            }
          });

          for (const userId in chatMap) {
            chatMap[userId].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          setConversations(chatMap);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserId, conversations]);

  const handleSendMessage = async () => {
    if (!selectedUserId || (!message.trim() && !file)) return;

    const formData = new FormData();
    formData.append('adminId', ADMIN_ID);
    formData.append('userId', selectedUserId);
    if (message.trim()) formData.append('message', message);
    if (file) formData.append('file', file);

    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/chat/reply', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        // This is the frontend fix: Manually create the "populated" object
        const newMessage = {
            ...json.data,
            senderId: { _id: ADMIN_ID, name: 'Admin' },
            receiverId: { _id: selectedUserId, name: conversations[selectedUserId].name }
        };

        setConversations(prev => ({
          ...prev,
          [selectedUserId]: {
            ...prev[selectedUserId],
            messages: [...(prev[selectedUserId]?.messages || []), newMessage],
          },
        }));

        setMessage('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  const selectedConversation = conversations[selectedUserId];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
      {/* LEFT PANEL: Chat List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
        {isLoading ? <p className="p-4 text-gray-500">Loading...</p> : (
          Object.keys(conversations)
            .sort((a, b) => {
              const lastMsgA = conversations[a].messages.slice(-1)[0];
              const lastMsgB = conversations[b].messages.slice(-1)[0];
              return new Date(lastMsgB?.timestamp || 0) - new Date(lastMsgA?.timestamp || 0);
            })
            .map(userId => {
              const convo = conversations[userId];
              const lastMessage = convo.messages.slice(-1)[0];
              return (
                <div key={userId} onClick={() => setSelectedUserId(userId)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedUserId === userId ? 'bg-purple-100' : ''}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex-shrink-0"></div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold truncate">{convo.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{lastMessage?.message || (lastMessage?.mediaUrl ? '📷 Image' : 'No messages')}</p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* RIGHT PANEL: Chat Window */}
      <div className="hidden md:flex w-2/3 flex-col">
        {selectedUserId ? (
          <>
            <div className="p-4 bg-purple-600 text-white font-bold shadow-md">{selectedConversation?.name}</div>
            <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
              {selectedConversation?.messages.map((msg) => {
                const isAdmin = msg.senderId?._id === ADMIN_ID; 
                return (
                  <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${isAdmin ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                      {msg.message && <p className="text-sm break-words">{msg.message}</p>}
                      {msg.mediaUrl && <img src={msg.mediaUrl} alt="media" className="max-w-full rounded-md mt-2" />}
                      <div className={`text-xs text-right mt-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>{formatTimestamp(msg.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
              <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-600 hover:text-purple-600"><BiPaperclip size={24} /></button>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={handleSendMessage} className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300" disabled={!message.trim() && !file}><BiSend size={20} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500"><p>Select a conversation to begin.</p></div>
        )}
      </div>
    </div>
  );
}

export default Chat;