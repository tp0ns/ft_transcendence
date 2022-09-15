import jwtDecode, { JwtPayload } from "jwt-decode";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../App";
import UserProp from "../../../interfaces/User.interface";
import Modal from "../../../ui/Modal/Modal";
import SettingsUser from "../SettingsUser/SettingsUser";
import AchievementList from "../StatList/AchievementList";
import classes from "./UserContent.module.css";

const UserContent: React.FC<{ userId: string }> = (props) => {
	const [user, setUser] = useState<UserProp>();
	const [settings, setSettings] = useState<boolean>(false);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);
	const [cookies] = useCookies();
	const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub;
	const navigate = useNavigate();

	useEffect(() => {
		// socket.emit("isBlocked", { id: props.userId });
		// socket.on("updatedRelations", () => {
		// 	socket.emit("isBlocked", { id: props.userId });
		// });
		socket.on("newDM", (id) => {
			navigate("/chat/" + id);
		});
		// socket.on("isBlockedRes", (res) => {
		// 	console.log("isBlockedRes");
		// 	setIsBlocked(res);
		// });
	}, []);

	useEffect(() => {
		async function getUserData() {
			const url = "/backend/users/" + props.userId;
			const response = await (await fetch(url)).json();
			setUser(response);
		}
		getUserData();
	}, [props.userId]);

	function changeUser(newUser: UserProp) {
		setUser(newUser);
	}

	function settingsLayout(settings: boolean) {
		if (settings) {
			return (
				<Modal
					title="Settings"
					onClick={clickHandler}
					className={classes.modal_layout}
				>
					<SettingsUser user={user as UserProp} onUserchange={changeUser} />
				</Modal>
			);
		}
	}

	function clickHandler() {
		setSettings((prev) => !prev);
	}

	function sendGameInvite() {
		console.log("entered in sendGaneInvite");
	}

	function unblockUser() {
		console.log("Entered in unblockUser");
	}

	function blockUser() {
		console.log("Entered in blockUser");
	}

	function sendMessage() {
		socket.emit("createDM", {
			title: "DM",
			DM: true,
			user2: props.userId,
			protected: false,
			private: false,
			password: null,
		});
	}

	return (
		<div>
			{clientId === user?.userId ? (
				<img
					src="/gear.svg"
					alt="Option button"
					onClick={clickHandler}
					className={classes.settings}
				/>
			) : null}
			{settingsLayout(settings)}
			<div className={classes.resume}>
				<img
					src={user?.profileImage ? user.profileImage : user?.image_url}
					alt="Avatar"
					className={classes.badge}
				/>
				<div className={classes.username}>{user?.username}</div>
			</div>
			{clientId !== user?.userId ? (
				<div className={classes.interact}>
					<div
						className={classes.button_div}
						onClick={() => {
							sendGameInvite();
						}}
					>
						<img
							src="/pong.svg"
							alt="Send game invite to user"
							className={classes.button_img}
						/>
					</div>
					<div
						className={classes.button_div}
						onClick={() => {
							sendMessage();
						}}
					>
						<img
							src="/chat.svg"
							alt="Send personnal message"
							className={classes.button_img}
						/>
					</div>
				</div>
			) : null}
			<div className={classes.infos}>
				<AchievementList userId={props.userId} />
				<div className={classes.try}>try</div>
				{/* <MatchList userId={props.userId} /> */}
			</div>
		</div>
	);
};

export default UserContent;

// {isBlocked ? (
// 	<div
// 		className={classes.button_div}
// 		onClick={() => {
// 			unblockUser();
// 		}}
// 	>
// 		<img
// 			src="/unban.svg"
// 			alt="Block user"
// 			className={classes.button_img}
// 		/>
// 	</div>
// ) : (
// 	<div
// 		className={classes.button_div}
// 		onClick={() => {
// 			blockUser();
// 		}}
// 	>
// 		<img
// 			src="/ban.svg"
// 			alt="Block user"
// 			className={classes.button_img}
// 		/>
// 	</div>
// )}
