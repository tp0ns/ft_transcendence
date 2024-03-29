import React from "react";
import { Link, useLocation } from "react-router-dom";
import classes from "./NavBar.module.css";

function NavBar() {
	const location = useLocation();

	return (
		<React.Fragment>
			<div className={classes.layout}>
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
								location.pathname === "/" ||
								location.pathname === "/waiting" ||
								location.pathname === "/game"
									? classes.selected
									: classes.unselected
							}
						>
							<img src="/pong.svg" alt="A ping pong racket" />
						</Link>
						<Link
							to="/user"
							className={
								location.pathname === "/user"
									? classes.selected
									: classes.unselected
							}
						>
							<img src="/user.svg" alt="A user icon" />
						</Link>
						<Link
							to="/social"
							className={
								location.pathname === "/social"
									? classes.selected
									: classes.unselected
							}
						>
							<img src="/friends.svg" alt="A friends icon" />
						</Link>
					</div>
					{/* Chat */}
					<div className={classes.chat}>
						<Link
							to="/chat"
							className={
								location.pathname === "/chat" ||
								location.pathname.startsWith("/chat/")
									? classes.selected
									: classes.unselected
							}
						>
							<img src="/chat.svg" alt="A chat icon" />
						</Link>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

export default NavBar;
