import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import UserList from '../components/chat/UserList';
import { Message } from '../types/chat';

const getWebSocketUrl = (channelId: string) => `wss://free.blr2.piesocket.com/v3/${channelId}?api_key=E7f5a9f2Yv5zY2z0X3c8L4n6K8m1J9v7&notify_self=1`;

const ChatRoom: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [room, setRoom] = useState('accelerate-ai-lobby');
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [displayNameInput, setDisplayNameInput] = useState('');
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize display name from user profile or stored value
    useEffect(() => {
        if (user) {
            const storedDisplayName = sessionStorage.getItem(`chatDisplayName_${user.id}`);
            if (storedDisplayName) {
                setDisplayName(storedDisplayName);
                setActiveUsers(new Set([storedDisplayName]));
                setIsDisplayNameModalOpen(false);
            } else {
                // Pre-fill with user's name if available
                const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || '';
                setDisplayNameInput(firstName);
            }
        }
    }, [user]);

    const connectWebSocket = () => {
        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
             console.log("WebSocket is already connecting or open.");
             return;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        ws.current = new WebSocket(getWebSocketUrl(room));
        setConnectionStatus('connecting');
        console.log(`Attempting to connect to room "${room}" (Attempt #${reconnectAttempt + 1})...`);

        ws.current.onopen = () => {
            console.log('WebSocket connection established.');
            setConnectionStatus('connected');
            setReconnectAttempt(0);

            // First, request current user list from any existing users
            const userListRequest = { event: 'request_users', user: displayName };
            ws.current?.send(JSON.stringify(userListRequest));

            // Then announce our arrival to the channel
            setTimeout(() => {
                const joinEvent = { event: 'join', user: displayName };
                ws.current?.send(JSON.stringify(joinEvent));

                // Start heartbeat to maintain presence
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                }
                heartbeatIntervalRef.current = setInterval(() => {
                    if (ws.current?.readyState === WebSocket.OPEN && displayName) {
                        const heartbeat = { event: 'heartbeat', user: displayName };
                        ws.current.send(JSON.stringify(heartbeat));
                    }
                }, 30000); // Send heartbeat every 30 seconds
            }, 100);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.event) { // It's a system event
                    switch(data.event) {
                        case 'join':
                            if (data.user && data.user !== displayName) {
                                console.log(`User ${data.user} joined, adding to active users`);
                                setActiveUsers(prev => {
                                    const newUsers = new Set(prev).add(data.user);
                                    console.log('Active users after join:', Array.from(newUsers));
                                    return newUsers;
                                });
                                setMessages(prev => [...prev, { id: `${Date.now()}-system`, user: 'System', text: `${data.user} has joined.` }]);

                                // Send our presence to the new user
                                const presenceMsg = { event: 'presence', user: displayName };
                                ws.current?.send(JSON.stringify(presenceMsg));
                                console.log(`Sent presence message for ${displayName}`);

                                // Also send current user list to help new user
                                setTimeout(() => {
                                    setActiveUsers(prev => {
                                        const currentUsers = Array.from(prev);
                                        const userListMsg = { event: 'user_list', users: currentUsers, from: displayName };
                                        ws.current?.send(JSON.stringify(userListMsg));
                                        console.log(`Sent user list:`, currentUsers);
                                        return prev;
                                    });
                                }, 50);
                            }
                            break;
                        case 'presence':
                            if (data.user && data.user !== displayName) {
                                console.log(`Received presence from ${data.user}`);
                                setActiveUsers(prev => {
                                    const newUsers = new Set(prev).add(data.user);
                                    console.log('Active users after presence:', Array.from(newUsers));
                                    return newUsers;
                                });
                            }
                            break;
                        case 'request_users':
                            if (data.user && data.user !== displayName) {
                                console.log(`User ${data.user} requesting user list`);
                                // Someone is requesting user list, send our presence
                                const presenceMsg = { event: 'presence', user: displayName };
                                ws.current?.send(JSON.stringify(presenceMsg));
                                console.log(`Sent presence in response to request`);
                            }
                            break;
                        case 'user_list':
                            if (data.users && data.from !== displayName) {
                                console.log(`Received user list from ${data.from}:`, data.users);
                                // Receive user list from existing user
                                setActiveUsers(prev => {
                                    const newUsers = new Set(prev);
                                    data.users.forEach((user: string) => {
                                        if (user !== displayName) {
                                            newUsers.add(user);
                                        }
                                    });
                                    console.log('Active users after user_list:', Array.from(newUsers));
                                    return newUsers;
                                });
                            }
                            break;
                        case 'leave':
                            if (data.user) {
                                setActiveUsers(prev => {
                                    const newUsers = new Set(prev);
                                    newUsers.delete(data.user);
                                    return newUsers;
                                });
                                setMessages(prev => [...prev, { id: `${Date.now()}-system`, user: 'System', text: `${data.user} has left.` }]);
                            }
                            break;
                        case 'heartbeat':
                            // Heartbeat from another user to maintain presence
                            if (data.user && data.user !== displayName) {
                                setActiveUsers(prev => new Set(prev).add(data.user));
                            }
                            break;
                    }
                } else if (data.user && data.text) { // It's a regular chat message
                    console.log(`Received message from ${data.user}: ${data.text}`);
                    setMessages(prev => [...prev, { ...data, id: `${Date.now()}-${Math.random()}` }]);
                } else {
                    console.log('Received unknown message format:', data);
                }
            } catch (error) {
                console.error('Failed to parse message:', event.data, error);
            }
        };

        ws.current.onerror = () => {
            console.error('A WebSocket error occurred. Check the browser console for details like "WebSocket connection to ... failed".');
            setConnectionStatus('error');
            ws.current?.close(); // Trigger onclose for reconnection logic
        };

        ws.current.onclose = (event) => {
            setConnectionStatus('disconnected');
            console.log(
                `WebSocket connection closed. Code: ${event.code}, Reason: '${event.reason || 'No reason specified'}', Clean close: ${event.wasClean}.`
            );

            if (!displayName || event.code === 1000) return;

            const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
            console.log(`Connection lost. Reconnecting in ${delay / 1000}s...`);

            reconnectTimeoutRef.current = setTimeout(() => {
                setReconnectAttempt(prev => prev + 1);
            }, delay);
        };
    };

    // Effect for managing the WebSocket lifecycle
    useEffect(() => {
        if (displayName) {
            connectWebSocket();
        }
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            ws.current?.close(1000, "Client session ended");
        };
    }, [displayName, reconnectAttempt, room]);

    // Effect for sending a leave message when the user closes the tab
     useEffect(() => {
        const handleBeforeUnload = () => {
            if (ws.current?.readyState === WebSocket.OPEN && displayName) {
                const leaveEvent = { event: 'leave', user: displayName };
                ws.current.send(JSON.stringify(leaveEvent));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [displayName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (userInput: string) => {
        if (ws.current?.readyState === WebSocket.OPEN && displayName) {
            const message = { user: displayName, text: userInput };
            console.log(`Sending message:`, message);
            ws.current.send(JSON.stringify(message));
        } else {
            console.log(`Cannot send message - WebSocket state: ${ws.current?.readyState}, displayName: ${displayName}`);
        }
    };

    const handleSetDisplayName = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedDisplayName = displayNameInput.trim();
        if (trimmedDisplayName && user) {
            setDisplayName(trimmedDisplayName);
            sessionStorage.setItem(`chatDisplayName_${user.id}`, trimmedDisplayName);
            setActiveUsers(new Set([trimmedDisplayName])); // Initialize user list with self
            setIsDisplayNameModalOpen(false);
        }
    };

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please log in to access the chat room.</p>
                </div>
            </div>
        );
    }

    if (isDisplayNameModalOpen) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Join the Chat</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                        Choose a display name for the chat room
                    </p>
                    <form onSubmit={handleSetDisplayName}>
                        <input
                            type="text"
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            placeholder="Enter your display name"
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition duration-300"
                            disabled={!displayNameInput.trim()}
                        >
                            Join Chat
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const getConnectionUI = () => {
        switch (connectionStatus) {
            case 'connecting': return { message: 'Connecting...', color: 'bg-yellow-600 dark:bg-yellow-700' };
            case 'disconnected':
            case 'error': return { message: 'Connection lost. Reconnecting...', color: 'bg-red-600 dark:bg-red-700' };
            default: return null;
        }
    };

    const connectionUI = getConnectionUI();

    return (
        <div className="h-full flex flex-col">
            <div className="flex h-full max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col flex-1 min-w-0">
                    <ChatHeader roomName={room} />
                    <div className="flex-1 p-6 overflow-y-auto">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} currentUser={displayName} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    {connectionUI && (
                        <div className={`p-2 text-center text-sm text-white ${connectionUI.color} transition-all duration-300`}>
                            {connectionUI.message}
                        </div>
                    )}
                    <ChatInput onSendMessage={handleSendMessage} disabled={connectionStatus !== 'connected'} />
                </div>
                <UserList users={activeUsers} currentUser={displayName} />
            </div>
        </div>
    );
};

export default ChatRoom;