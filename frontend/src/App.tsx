import { Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import Auth from "./components/Auth";
import ChatPage from "./Pages/ChatPage/ChatPage";
import GamePage from "./Pages/GamePage";
import LoginPage from "./Pages/Login/LoginPage/LoginPage";
import SocialPage from "./Pages/SocialPage/SocialPage";
import TwoFAPAge from "./Pages/Login/TwoFAPage/TwoFAPage";
import UserPage from "./Pages/UserPage/UserPage";
import { ErrorContextProvider } from "./context/error-context";
import HomePage from "./Pages/HomePage/HomePage";
import WaitingPage from "./Pages/WaitingPage/WaitingPage";

export const socket = io("/");
export const socketId = socket.on("connect", () => {
	return socket.id;
});

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="2fa"
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
						<HomePage />
					</Auth>
				}
			/>
			<Route
				path="/waiting"
				element={
					<Auth>
						<WaitingPage />
					</Auth>
				}
			/>
			<Route
				path="/game"
				element={
					<Auth>
						<GamePage />
					</Auth>
				}
			/>
			<Route
				path="user"
				element={
					<Auth>
						<UserPage userId="me" />
					</Auth>
				}
			/>
			<Route
				path="social"
				element={
					<Auth>
						<SocialPage />
					</Auth>
				}
			/>
			<Route
				path="chat"
				element={
					<Auth>
						<ChatPage />
					</Auth>
				}
			/>
			<Route
				path="chat/:channelId"
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
