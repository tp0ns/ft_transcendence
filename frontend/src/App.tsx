import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ChatPage from "./Pages/ChatPage";
import Debug from "./Pages/Debug";
import ChannelsContextProvider from "./store/channels-context";

function App() {
  return (
    <ChannelsContextProvider>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/debug" element={<Debug />} />
      </Routes>
    </ChannelsContextProvider>
  );
}

export default App;
