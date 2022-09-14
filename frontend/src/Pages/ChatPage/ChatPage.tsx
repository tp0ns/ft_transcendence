import classes from "./ChatPage.module.css";
import { ChatContextProvider } from "../../context/chat-context";
import ChanList from "../../components/chat/ChanList/ChanList";
import Layout from "../../components/Layout/Layout";
import ChanContent from "../../components/chat/ChanContent/ChanContent";

function ChatPage() {
	return (
		<Layout>
			<ChatContextProvider>
				<div className={classes.layout}>
					<ChanList />
					<ChanContent />
				</div>
			</ChatContextProvider>
		</Layout>
	);
}

export default ChatPage;
