import React from "react";
import { Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";
import Auth from "./components/Auth";
import ChatPage from "./Pages/ChatPage";
import GamePage from "./Pages/GamePage";
import LoginPage from "./Pages/LoginPage";
import SocialPage from "./Pages/SocialPage";
import TwoFAPAge from "./Pages/TwoFAPage";
import UserPage from "./Pages/UserPage";

export const socket = io("http://localhost/");

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/2fa"
        element={
          <Auth>
            <TwoFAPAge />
          </Auth>
        }
      />
      <Route
        path="/"
        element={
          <Auth>
            <GamePage />
          </Auth>
        }
      />
      <Route
        path="/user"
        element={
          <Auth>
            <UserPage />
          </Auth>
        }
      />
      <Route
        path="/social"
        element={
          <Auth>
            <SocialPage />
          </Auth>
        }
      />
      <Route
        path="/chat"
        element={
          <Auth>
            <ChatPage />
          </Auth>
        }
      />
    </Routes>
  );
}

export default App;
