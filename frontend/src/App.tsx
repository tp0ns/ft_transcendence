import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import RequireAuth from "./components/RequireAuth";
import ChatPage from "./Pages/ChatPage";
import LoginPage from "./Pages/LoginPage";
import TwoFAPAge from "./Pages/TwoFAPage";
import ChannelsContextProvider from "./store/channels-context";

function App() {
	return (
		<ChannelsContextProvider>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/"
					element={
						<RequireAuth>
							<div>Acceuil</div>
						</RequireAuth>
					}
				/>
				<Route
					path="/2fa"
					element={
						<RequireAuth>
							<TwoFAPAge />
						</RequireAuth>
					}
				/>
				<Route
					path="/chat"
					element={
						<RequireAuth>
							<ChatPage />
						</RequireAuth>
					}
				/>
			</Routes>
		</ChannelsContextProvider>
	);
}

export default App;
