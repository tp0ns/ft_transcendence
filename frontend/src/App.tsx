import React from "react";
import { Routes, Route } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import "./App.css";
import ChatPage from "./Pages/ChatPage";
import Debug from "./Pages/Debug";
import GamePage from "./Pages/GamePage";

export const socket: Socket = io("http://localhost");

function App() {
  return (
    <Routes>
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  );
}

export default App;
