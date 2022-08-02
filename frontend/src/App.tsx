import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ChatPage from "./Pages/ChatPage";
import GamePage from "./Pages/GamePage";
import ChannelsContextProvider from "./store/channels-context";

function App() {
  return (
    <ChannelsContextProvider>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </ChannelsContextProvider>
  );
}

export default App;
