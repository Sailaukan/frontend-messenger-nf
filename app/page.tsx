"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import MyMessage from "./components/myMessage";
import TheirMessage from "./components/theirMessage";

interface User {
  _id: string;
  email: string;
  username: string;
}

let socket = io("http://localhost:3000");

export default function Home() {

  const [isAuth, setIsAuth] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [room, setRoom] = useState<string>();
  const [email, setEmail] = useState<string>('');
  const [myEmail, setMyEmail] = useState<string>('');
  const [receiverEmail, setReceiverEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [userStatuses, setUserStatuses] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [receiverTyping, setReceiverTyping] = useState<boolean>(false);

  let typingTimeout: NodeJS.Timeout;

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
  };
  const handleMessageChange = (event: any) => {
    setMessage(event.target.value);
    setIsTyping(true);

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("send-typing", room, myEmail, false);
      setIsTyping(false);
    }, 3000);
    socket.emit("send-typing", room, myEmail, true);
  };

  const handlePasswordChange = (event: any) => {
    setPassword(event.target.value);
  };

  useEffect(() => {
    socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("updateUserStatus", (onlineUsers) => {
      console.log('received', onlineUsers);
      setUserStatuses(onlineUsers);
    });

    socket.on("hello", (arg) => {
      console.log(arg);
      toast(arg);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("receive-message", (newMessage: string) => {
      console.log("New message: ", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("receive-typing", (emailA: string, isTypingA: boolean) => {
      if (emailA !== myEmail) {
        setReceiverTyping(isTypingA);
      }
    });
  }, [myEmail]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/users');
      const users = response.data;

      setUsers(users);

      console.log(users);

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = () => {
    if (room) {
      socket.emit("send-message", room, myEmail, message);
      setMessage('');
    }
  };

  const joinRoom = (p1: string, p2: string) => {
    const roomName = [p1, p2].sort().join("-");
    setRoom(roomName);
    setReceiverEmail(p2);
    socket.emit("join-room", roomName);
  };

  const sendUser = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/login', {
        email: email,
        password: password
      });
      if (response.status === 200) {
        console.log(response.data);
        setIsAuth(true);
        setMyEmail(email);
        socket.emit("user-online", email);
        fetchUsers();
      } else {
        console.error('Authentication failed');
        setIsAuth(false);
      }
    } catch (error) {
      console.error('Error occurred during authentication', error);
      setIsAuth(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-[400px] space-y-6 mt-[100px]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your account.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="username"
                placeholder="Enter your email"
                onChange={handleEmailChange}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="password"
                placeholder="Enter your password"
                type="password"
                onChange={handlePasswordChange}
              />
            </div>
          </div>
          <div className="flex items-center p-6">
            <button
              onClick={sendUser}
              className="inline-flex border-gray-700 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground  hover:bg-black hover:text-white h-10 px-4 py-2 w-full">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <main className="flex min-h-screen flex-row items-center justify-between p-4">
        <div className={`flex flex-col h-screen text-white bg-gray-100 dark:bg-gray-900 w-3/5 ${receiverEmail ? '' : 'blur-md'}`}>
          {receiverTyping ? "Typing" : ""}
          <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xl text-gray-900 dark:text-gray-100">{receiverEmail}</div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages && messages.map((message) => (
              message.split(": ")[0] === myEmail
                ? <MyMessage key={message} text={message.split(": ")[1]} />
                : <TheirMessage key={message} text={message.split(": ")[1]} />
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center">
            <textarea
              value={message}
              onChange={handleMessageChange}
              className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1 resize-none border-none focus:ring-0 focus:outline-none bg-transparent dark:text-gray-200"
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-black hover:text-white h-10 px-4 py-2 ml-2">
              Send
            </button>
          </div>
        </div>

        <aside className="h-screen p-5 w-2/5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-5">Contacts</h2>
          <ul className="space-y-3">
            {users.map((user: User) => (
              <li
                key={user._id}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${room && room.includes(user.email) ? "bg-blue-200 dark:bg-gray-700" : "bg-white dark:bg-gray-800"} shadow-md`}
                onClick={() => joinRoom(myEmail, user.email)}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${userStatuses.includes(user.email) ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm font-medium">{user.email}</span>
              </li>
            ))}
          </ul>
        </aside>

        <ToastContainer />
      </main>
    );
  }
}
