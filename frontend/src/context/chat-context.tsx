import React, { useState, useEffect } from "react";
import { JsxElement } from "typescript";

const ChatContext = React.createContext({
	activeChan: "new_chan",
	changeActiveChan: (chat: string) => {},
});

export const ChatContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [activeChan, setactiveChan] = useState("new_chan");

	function changeActiveChan(chat_name: string) {
		console.log("change chat to : " + chat_name);
		setactiveChan(chat_name);
	}

	return (
		<ChatContext.Provider
			value={{
				activeChan: activeChan,
				changeActiveChan: changeActiveChan,
			}}
		>
			{props.children}
		</ChatContext.Provider>
	);
};

export default ChatContext;
