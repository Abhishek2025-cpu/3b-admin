// // src/components/Chat.jsx

// import React, { useState, useEffect, useRef } from 'react';
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
//   const [conversations, setConversations] = useState({});
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [message, setMessage] = useState('');
//   const [file, setFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

// useEffect(() => {
//   const fetchAllChats = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/chat/admin/all');
//       const json = await res.json();
//       if (json.success) {
//         const chatMap = {};

//         json.data.forEach(msg => {
//           const sender = msg.sender || msg.senderId;
//           const receiver = msg.receiver || msg.receiverId;

//           const isAdminSender = sender._id === ADMIN_ID;
//           const otherUser = isAdminSender ? receiver : sender;

//           if (!otherUser || !otherUser._id) return;

//           const userId = otherUser._id;

//           if (!chatMap[userId]) {
//             chatMap[userId] = {
//               name: otherUser.name || 'Unknown',
//               messages: []
//             };
//           }

//           chatMap[userId].messages.push(msg);
//         });

//         // Sort messages in each conversation
//         Object.values(chatMap).forEach(convo => {
//           convo.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
//         });

//         setConversations(chatMap);
//       } else {
//         console.error("Chat fetch failed:", json.message);
//       }
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchAllChats();
// }, []);


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

import React, { useState, useEffect, useRef } from 'react';
// NEW: Import useParams to read URL parameters
import { useParams } from 'react-router-dom';
import { BiSend, BiPaperclip } from 'react-icons/bi';

const ADMIN_ID = "68411a77cdc05295de45af4e";

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

function Chat() {
  // NEW: Get the userId from the URL, if it exists
  const { userId: userIdFromUrl } = useParams();
  
  const [conversations, setConversations] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAllChats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/chat/admin/all');
        const json = await res.json();
        if (json.success) {
          const chatMap = {};

          json.data.forEach(msg => {
            const sender = msg.sender || msg.senderId;
            const receiver = msg.receiver || msg.receiverId;

            const isAdminSender = sender._id === ADMIN_ID;
            const otherUser = isAdminSender ? receiver : sender;

            if (!otherUser || !otherUser._id) return;

            const userId = otherUser._id;

            if (!chatMap[userId]) {
              chatMap[userId] = {
                name: otherUser.name || 'Unknown',
                messages: []
              };
            }

            chatMap[userId].messages.push(msg);
          });

          // Sort messages in each conversation
          Object.values(chatMap).forEach(convo => {
            convo.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          });

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

  // NEW: This effect runs when the component loads or the URL parameter changes
  useEffect(() => {
    // If a user ID is provided in the URL and that conversation exists, select it.
    if (userIdFromUrl && conversations[userIdFromUrl]) {
      setSelectedUserId(userIdFromUrl);
    }
  }, [userIdFromUrl, conversations]); // Reruns when URL param or conversations data changes

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
      const res = await fetch(
        'https://threebapi-1067354145699.asia-south1.run.app/api/chat/reply',
        { method: 'POST', body: formData }
      );
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
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        console.error("Message send failed:", json.message);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const selectedConversation = conversations[selectedUserId];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Left: Conversation List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : Object.keys(conversations).length === 0 ? (
          <p className="p-4 text-gray-500">No conversations found.</p>
        ) : (
          Object.keys(conversations)
            .sort((a, b) => {
              const ma = conversations[a].messages;
              const mb = conversations[b].messages;
              const ta = ma[ma.length - 1]?.timestamp || 0;
              const tb = mb[mb.length - 1]?.timestamp || 0;
              return new Date(tb) - new Date(ta);
            })
            .map(userId => {
              const convo = conversations[userId];
              const last = convo.messages[convo.messages.length - 1];
              return (
                <div
                  key={userId}
                  onClick={() => setSelectedUserId(userId)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                    selectedUserId === userId ? 'bg-purple-100' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold truncate">{convo.name}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {last?.message || (last?.mediaUrl ? '📷 Image' : 'No messages')}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Right: Chat Window */}
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedUserId && selectedConversation ? (
          <>
            <div className="p-4 bg-purple-600 text-white font-bold shadow-md">
              {selectedConversation.name}
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
              {selectedConversation.messages.map(msg => {
                const isAdmin = msg.senderId === ADMIN_ID;
                return (
                  <div
                    key={msg._id || Math.random()}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${
                        isAdmin ? 'bg-blue-500 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {msg.message && (
                        <p className="text-sm break-words">{msg.message}</p>
                      )}
                      {msg.mediaUrl && (
                        <img
                          src={msg.mediaUrl}
                          alt="media"
                          className="max-w-full rounded-md mt-2"
                        />
                      )}
                      <div
                        className={`text-xs text-right mt-1 ${
                          isAdmin ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-purple-600"
              >
                <BiPaperclip size={24} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
              />
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
                disabled={!message.trim() && !file}
              >
                <BiSend size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;