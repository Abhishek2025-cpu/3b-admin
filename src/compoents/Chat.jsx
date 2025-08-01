

// import React, { useState, useEffect, useRef } from 'react';
// // NEW: Import useParams to read URL parameters
// import { useParams } from 'react-router-dom';
// import { BiSend, BiPaperclip } from 'react-icons/bi';

// const ADMIN_ID = "68411a77cdc05295de45af4e";

// const formatTimestamp = (isoString) => {
//   if (!isoString) return '';
//   const date = new Date(isoString);
//   return date.toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true
//   });
// };

// function Chat() {
//   // NEW: Get the userId from the URL, if it exists
//   const { userId: userIdFromUrl } = useParams();
  
//   const [conversations, setConversations] = useState({});
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [message, setMessage] = useState('');
//   const [file, setFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const fetchAllChats = async () => {
//       setIsLoading(true);
//       try {
//         const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/chat/admin/all');
//         const json = await res.json();
//         if (json.success) {
//           const chatMap = {};

//           json.data.forEach(msg => {
//             const sender = msg.sender || msg.senderId;
//             const receiver = msg.receiver || msg.receiverId;

//             const isAdminSender = sender._id === ADMIN_ID;
//             const otherUser = isAdminSender ? receiver : sender;

//             if (!otherUser || !otherUser._id) return;

//             const userId = otherUser._id;

//             if (!chatMap[userId]) {
//               chatMap[userId] = {
//                 name: otherUser.name || 'Unknown',
//                 messages: []
//               };
//             }

//             chatMap[userId].messages.push(msg);
//           });

//           // Sort messages in each conversation
//           Object.values(chatMap).forEach(convo => {
//             convo.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
//           });

//           setConversations(chatMap);
//         } else {
//           console.error("Chat fetch failed:", json.message);
//         }
//       } catch (err) {
//         console.error("Error fetching chats:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllChats();
//   }, []);

//   // NEW: This effect runs when the component loads or the URL parameter changes
//   useEffect(() => {
//     // If a user ID is provided in the URL and that conversation exists, select it.
//     if (userIdFromUrl && conversations[userIdFromUrl]) {
//       setSelectedUserId(userIdFromUrl);
//     }
//   }, [userIdFromUrl, conversations]); // Reruns when URL param or conversations data changes

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [selectedUserId, conversations]);

//   const handleSendMessage = async () => {
//     if (!selectedUserId || (!message.trim() && !file)) return;

//     const formData = new FormData();
//     formData.append('adminId', ADMIN_ID);
//     formData.append('userId', selectedUserId);
//     if (message.trim()) formData.append('message', message);
//     if (file) formData.append('file', file);

//     try {
//       const res = await fetch(
//         'https://threebapi-1067354145699.asia-south1.run.app/api/chat/reply',
//         { method: 'POST', body: formData }
//       );
//       const json = await res.json();
//       if (json.success) {
//         const newMessage = json.data;
//         setConversations(prev => ({
//           ...prev,
//           [selectedUserId]: {
//             ...prev[selectedUserId],
//             messages: [...(prev[selectedUserId]?.messages || []), newMessage]
//           }
//         }));
//         setMessage('');
//         setFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//       } else {
//         console.error("Message send failed:", json.message);
//       }
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     }
//   };

//   const selectedConversation = conversations[selectedUserId];

//   return (
//     <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
//       {/* Left: Conversation List */}
//       <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
//         {isLoading ? (
//           <p className="p-4 text-gray-500">Loading...</p>
//         ) : Object.keys(conversations).length === 0 ? (
//           <p className="p-4 text-gray-500">No conversations found.</p>
//         ) : (
//           Object.keys(conversations)
//             .sort((a, b) => {
//               const ma = conversations[a].messages;
//               const mb = conversations[b].messages;
//               const ta = ma[ma.length - 1]?.timestamp || 0;
//               const tb = mb[mb.length - 1]?.timestamp || 0;
//               return new Date(tb) - new Date(ta);
//             })
//             .map(userId => {
//               const convo = conversations[userId];
//               const last = convo.messages[convo.messages.length - 1];
//               return (
//                 <div
//                   key={userId}
//                   onClick={() => setSelectedUserId(userId)}
//                   className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
//                     selectedUserId === userId ? 'bg-purple-100' : ''
//                   }`}
//                 >
//                   <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex-shrink-0" />
//                   <div className="flex-1 overflow-hidden">
//                     <h4 className="font-semibold truncate">{convo.name}</h4>
//                     <p className="text-sm text-gray-600 truncate">
//                       {last?.message || (last?.mediaUrl ? '📷 Image' : 'No messages')}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })
//         )}
//       </div>

//       {/* Right: Chat Window */}
//       <div className="w-full md:w-2/3 flex flex-col">
//         {selectedUserId && selectedConversation ? (
//           <>
//             <div className="p-4 bg-purple-600 text-white font-bold shadow-md">
//               {selectedConversation.name}
//             </div>
//             <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
//               {selectedConversation.messages.map(msg => {
//                 const isAdmin = msg.senderId === ADMIN_ID;
//                 return (
//                   <div
//                     key={msg._id || Math.random()}
//                     className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-3`}
//                   >
//                     <div
//                       className={`max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${
//                         isAdmin ? 'bg-blue-500 text-white' : 'bg-white text-black'
//                       }`}
//                     >
//                       {msg.message && (
//                         <p className="text-sm break-words">{msg.message}</p>
//                       )}
//                       {msg.mediaUrl && (
//                         <img
//                           src={msg.mediaUrl}
//                           alt="media"
//                           className="max-w-full rounded-md mt-2"
//                         />
//                       )}
//                       <div
//                         className={`text-xs text-right mt-1 ${
//                           isAdmin ? 'text-blue-200' : 'text-gray-400'
//                         }`}
//                       >
//                         {formatTimestamp(msg.timestamp)}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={messagesEndRef} />
//             </div>
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 className="p-2 text-gray-600 hover:text-purple-600"
//               >
//                 <BiPaperclip size={24} />
//               </button>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={e => setFile(e.target.files[0])}
//                 className="hidden"
//               />
//               <input
//                 type="text"
//                 value={message}
//                 onChange={e => setMessage(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
//                 placeholder="Type a message..."
//                 className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//               <button
//                 onClick={handleSendMessage}
//                 className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
//                 disabled={!message.trim() && !file}
//               >
//                 <BiSend size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-500">
//             <p>Select a conversation to begin.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Chat;





// src/components/Chat.jsx
// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BiSend, BiPaperclip, BiLoaderAlt } from 'react-icons/bi';
import { IoClose } from "react-icons/io5";

// --- Constants ---
const ADMIN_ID = "68411a77cdc05295de45af4e";
const API_BASE_URL = "https://threebapi-1067354145699.asia-south1.run.app/api";

// --- Helper Functions ---
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

// --- Child Components for Cleaner UI ---

const ConversationItem = ({ convo, userId, isSelected, onSelect }) => {
  const lastMessage = convo.messages[convo.messages.length - 1];
  const lastMessageText = lastMessage?.message || (lastMessage?.mediaUrl ? '📷 Image sent' : 'No messages yet');

  return (
    <div
      onClick={() => onSelect(userId)}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 border-l-4 ${
        isSelected ? 'bg-slate-100 border-purple-600' : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
        {convo.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-semibold text-slate-800 truncate">{convo.name}</h4>
        <p className="text-sm text-slate-500 truncate">{lastMessageText}</p>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isAdmin = message.senderId === ADMIN_ID;
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-md p-3 rounded-xl shadow-sm ${
          isAdmin ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'
      }`}>
        {/* THE FIX: Read image from mediaUrl.url */}
        {message.mediaUrl && message.mediaUrl.url && (
          <img
            src={message.mediaUrl.url}
            alt="media content"
            className="max-w-full rounded-lg mb-2"
          />
        )}
        {message.message && (
          <p className="text-sm break-words">{message.message}</p>
        )}
        <div className={`text-xs text-right mt-1.5 ${isAdmin ? 'text-purple-200' : 'text-slate-400'}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ message, setMessage, previewUrl, onSendMessage, onFileChange, onRemoveFile, fileInputRef }) => (
  <div className="p-4 bg-white border-t border-slate-200">
    {previewUrl && (
      <div className="relative inline-block mb-3 p-2 bg-slate-100 rounded-lg">
        <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded" />
        <button
          onClick={onRemoveFile}
          className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
          aria-label="Remove image"
        >
          <IoClose size={16} />
        </button>
      </div>
    )}
    <div className="flex items-center gap-4">
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
      <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-purple-600 transition-colors">
        <BiPaperclip size={24} />
      </button>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSendMessage()}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={onSendMessage}
        className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
        disabled={!message.trim() && !previewUrl}
      >
        <BiSend size={22} />
      </button>
    </div>
  </div>
);

const WelcomeScreen = () => (
  <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-50">
    <p className="text-lg">Select a conversation to begin chatting.</p>
  </div>
);

const LoadingIndicator = ({ text = "Loading..."}) => (
  <div className="flex items-center justify-center p-6 text-slate-500">
    <BiLoaderAlt className="animate-spin mr-2" />
    <span>{text}</span>
  </div>
);

// --- Main Chat Component ---

function Chat() {
  const { userId: userIdFromUrl } = useParams();
  
  const [conversations, setConversations] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAllChats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/chat/admin/all`);
        const json = await res.json();
        if (json.success) {
          const chatMap = {};
          json.data.forEach(msg => {
            const sender = msg.sender || msg.senderId;
            const receiver = msg.receiver || msg.receiverId;
            if (!sender || !receiver) return;

            const isAdminSender = sender._id === ADMIN_ID;
            const otherUser = isAdminSender ? receiver : sender;
            if (!otherUser?._id) return;

            if (!chatMap[otherUser._id]) {
              chatMap[otherUser._id] = { name: otherUser.name || 'Unknown User', messages: [] };
            }
            chatMap[otherUser._id].messages.push(msg);
          });
          
          Object.values(chatMap).forEach(convo => convo.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
          setConversations(chatMap);
        } else {
          console.error("Chat fetch failed:", json.message);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllChats();
  }, []);
  
  useEffect(() => {
    if (userIdFromUrl && conversations[userIdFromUrl]) {
      setSelectedUserId(userIdFromUrl);
    }
  }, [userIdFromUrl, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserId, conversations]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || (!message.trim() && !file)) return;
    const formData = new FormData();
    formData.append('adminId', ADMIN_ID);
    formData.append('userId', selectedUserId);
    if (message.trim()) formData.append('message', message);
    if (file) formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/chat/reply`, { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        const newMessage = json.data;
        setConversations(prev => ({
          ...prev,
          [selectedUserId]: {
            ...prev[selectedUserId],
            messages: [...(prev[selectedUserId]?.messages || []), newMessage]
          }
        }));
        setMessage('');
        handleRemoveFile();
      } else {
        console.error("Message send failed:", json.message);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const selectedConversation = conversations[selectedUserId];
  const sortedConversationKeys = Object.keys(conversations).sort((a, b) => {
    const lastMsgA = conversations[a].messages.slice(-1)[0];
    const lastMsgB = conversations[b].messages.slice(-1)[0];
    return new Date(lastMsgB?.timestamp || 0) - new Date(lastMsgA?.timestamp || 0);
  });

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Left: Conversation List */}
      <div className="w-full md:w-1/3 xl:w-1/4 border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Conversations</h2>
        </div>
        {isLoading ? (
          <LoadingIndicator />
        ) : sortedConversationKeys.length === 0 ? (
          <p className="p-4 text-slate-500">No conversations found.</p>
        ) : (
          sortedConversationKeys.map(userId => (
            <ConversationItem
              key={userId}
              convo={conversations[userId]}
              userId={userId}
              isSelected={selectedUserId === userId}
              onSelect={setSelectedUserId}
            />
          ))
        )}
      </div>

      {/* Right: Chat Window */}
      <div className="w-full md:w-2/3 xl:w-3/4 flex flex-col bg-slate-50">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-white text-slate-800 font-bold shadow-sm border-b border-slate-200">
              {selectedConversation.name}
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedConversation.messages.map(msg => <MessageBubble key={msg._id || Math.random()} message={msg} />)}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput
              message={message}
              setMessage={setMessage}
              previewUrl={previewUrl}
              onSendMessage={handleSendMessage}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              fileInputRef={fileInputRef}
            />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}

export default Chat;