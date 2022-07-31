import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ChatPage from "./Pages/ChatPage";
import ChannelsContextProvider from "./store/channels-context";

function App() {
  return (
    <ChannelsContextProvider>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </ChannelsContextProvider>
  );
}

export default App;
