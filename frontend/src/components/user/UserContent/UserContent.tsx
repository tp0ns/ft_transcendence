import jwtDecode, { JwtPayload } from "jwt-decode";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import UserProp from "../../../interfaces/User.interface";
import Modal from "../../../ui/Modal/Modal";
import SettingsUser from "../SettingsUser/SettingsUser";
import classes from "./UserContent.module.css";

const UserContent: React.FC<{ userId: string }> = (props) => {
	const [user, setUser] = useState<UserProp>();
	const [settings, setSettings] = useState<boolean>(false);
	const [cookies] = useCookies();
	const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub;

	useEffect(() => {
		async function getUserData() {
			const url = "/backend/users/" + props.userId;
			const response = await (await fetch(url)).json();
			setUser(response);
		}
		getUserData();
	}, []);

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
		</div>
	);
};

export default UserContent;
