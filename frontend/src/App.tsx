import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ChatPage from "./Pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
