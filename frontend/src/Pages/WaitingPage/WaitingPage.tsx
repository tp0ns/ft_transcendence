import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import Layout from "../../components/Layout/Layout";
import classes from "WaitingPage.module.css";

const WaitingPage: React.FC<{}> = () => {
	const navigate = useNavigate();

	useEffect(() => {
		console.log("Je suis dans la waiting page");
		socket.emit("needWaiting");
		socket.on("updateInvitation", () => {
			socket.emit("needWaiting");
		});
		socket.on("waiting", (wait) => {
			if (!wait) navigate("/");
		});
		socket.on("matchAccepted", (roomId) => {
			socket.emit("joinGame", roomId);
			navigate("/game");
		});
	}, []);

	return (
		<Layout>
			<p>Waiting page</p>
		</Layout>
	);
};

export default WaitingPage;
