import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import classes from "./NavBar.module.css";

const NavBar = () => {
	const location = useLocation();

	return (
		<div className={classes.layout}>
			{/* NavBar Links */}
			{/* {location.pathname === "/" ? <div className={classes.game}></div> : null}
			{location.pathname === "/user" ? (
				<div className={classes.user}></div>
			) : null}
			{location.pathname === "/social" ? (
				<div className={classes.social}></div>
			) : null}
			{location.pathname === "/chat" ? (
				<div className={classes.chat}></div>
			) : null} */}
			<div className={classes.links}>
				{/* Logo */}
				<Link to="/" className={classes.logo}>
					PONG
				</Link>
				{/* Pages */}
				<div className={classes.pages}>
					<Link
						to="/"
						className={
							location.pathname === "/" ? classes.selected : classes.unselected
						}
					>
						<img src="pong.svg" alt="A ping pong racket" />
					</Link>
					<Link
						to="/user"
						className={
							location.pathname === "/user"
								? classes.selected
								: classes.unselected
						}
					>
						<img src="user.svg" alt="A user icon" />
					</Link>
					<Link
						to="/social"
						className={
							location.pathname === "/social"
								? classes.selected
								: classes.unselected
						}
					>
						<img src="friends.svg" alt="A friends icon" />
					</Link>
				</div>
				{/* Chat */}
				<Link
					to="/chat"
					className={
						location.pathname === "/chat"
							? classes.selected
							: classes.unselected
					}
				>
					<img src="chat.svg" alt="A chat icon" />
				</Link>
			</div>
		</div>
	);
};

export default NavBar;
