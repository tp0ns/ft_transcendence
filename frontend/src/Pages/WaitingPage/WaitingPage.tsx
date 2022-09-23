import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isConstructorDeclaration } from "typescript";
import { socket } from "../../App";
import Layout from "../../components/Layout/Layout";

const WaitingPage: React.FC<{}> = () => {
	const navigate = useNavigate();

	useEffect(() => {
		console.log("Je suis dans la waiting page");
		socket.emit("needWaiting");
		socket.on("updateInvitation", () => {
			socket.emit("needWaiting");
		});
		socket.on("waiting", (wait) => {
			console.log("needwaiting: ", wait);
			if (!wait) navigate("/");
		});
		socket.on("matchAccepted", () => {
			console.log("entered Match accepted");
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
