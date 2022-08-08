import jwtDecode, { JwtPayload } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import UserProp from "../../interfaces/User.interface";
import classes from "./UserPage.module.css";

const UserPage = () => {
	const [user, setUser] = useState<UserProp>();
	const [settings, setSettings] = useState<boolean>(false);
	const [cookies] = useCookies();
	const navigate = useNavigate();
	const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub;

	useEffect(() => {
		async function getUserData() {
			try {
				const response = await (
					await fetch("http://localhost/backend/users/me")
				).json();
				setUser(response);
			} catch (err) {
				console.log(err);
			}
		}
		getUserData();
	}, [settings]);

	function clickHandler() {
		setSettings((prev) => !prev);
		console.log(settings);
	}

	return (
		<React.Fragment>
			<NavBar />
			{clientId === user?.userId ? (
				<button onClick={clickHandler} className={classes.settings}>
					Settings
				</button>
			) : (
				<button onClick={() => navigate(-1)} className={classes.back}>
					Back
				</button>
			)}
			<div className={classes.resume}>
				<img
					src={user?.profileImage ? user.profileImage : user?.image_url}
					alt="Profile picture"
					className={classes.badge}
				/>
				<div className={classes.username}>{user?.username}</div>
			</div>
		</React.Fragment>
	);
};

export default UserPage;
