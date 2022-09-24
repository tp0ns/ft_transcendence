import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import Layout from "../../components/Layout/Layout";
import classes from "./WaitingPage.module.css";

const WaitingPage: React.FC<{}> = () => {
	const navigate = useNavigate();

	useEffect(() => {
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
			<div className={classes.fakegame}>
				<div className={classes.title}>Waiting for opponent</div>
				<div className={classes.buttons}>
					<div className={classes.pad}></div>
					<div className={classes.loading}></div>
					<div className={classes.pad}></div>
				</div>
			</div>
		</Layout>
	);
};

export default WaitingPage;
