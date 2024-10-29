import React, { useEffect, useRef, useState } from "react";
import { user } from "../Join/Join";
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";

const ENDPOINT = "http://localhost:4500/";

const Chat = () => {
  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef();

  
  const send = () => {
    const message = document.getElementById("chatInput").value;
    if (message) {
      socket.current.emit("message", { message, id });
      document.getElementById("chatInput").value = "";
    }
  };

  
  useEffect(() => {
    socket.current = socketIo(ENDPOINT, { transports: ["websocket"] });

    
    socket.current.on("connect", () => {
      alert("connected");
      setId(socket.current.id);
    });

    socket.current.emit("joined", { user });

    
    socket.current.on("welcome", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.current.on("userJoined", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.current.on("leave", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    
    return () => {
      socket.current.disconnect(); 
    };
  }, []);

  
  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.current.on("sendMessage", handleMessage);

    
    return () => {
      socket.current.off("sendMessage", handleMessage);
    };
  }, []);

  return (
    <div className="chatPage">
      <div className="chatContainer">
        <div className="header">
          <h2>C CHAT</h2>
          <a href="/">
            <img src={closeIcon} alt="Close" />
          </a>
        </div>
        <ReactScrollToBottom className="chatBox">
          {messages.map((item, i) => (
            <Message
              key={i}
              user={item.id === id ? "" : item.user}
              message={item.message}
              classs={item.id === id ? "right" : "left"}
            />
          ))}
        </ReactScrollToBottom>
        <div className="inputBox">
          <input
            type="text"
            id="chatInput"
            onKeyPress={(event) => (event.key === "Enter" ? send() : null)}
          />
          <button onClick={send} className="sendBtn">
            <img src={sendLogo} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
