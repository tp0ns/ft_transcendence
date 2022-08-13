import React, { useState, useEffect } from "react";
import { JsxElement } from "typescript";

const ChatContext = React.createContext({
	activeChat: "new_chat",
	changeActiveChat: (chat: string) => {},
});

export const ChatContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [activeChat, setActiveChat] = useState("new_chat");

	function changeActiveChat(chat_name: string) {
		console.log("change chat to : " + chat_name);
	}

	return (
		<ChatContext.Provider
			value={{
				activeChat: activeChat,
				changeActiveChat: changeActiveChat,
			}}
		>
			{props.children}
		</ChatContext.Provider>
	);
};

export default ChatContext;
