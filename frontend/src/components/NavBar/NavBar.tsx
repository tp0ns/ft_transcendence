import classes from "./NavBar.module.css";

const NavBar = () => {
	return (
		<div className={classes.layout}>
			{/* NavBar Links */}
			<div className={classes.links}>
				{/* Logo */}
				<a href="http://localhost/" className={classes.logo}>
					PONG
				</a>
				{/* Pages */}
				<ul className={classes.pages}>
					<li>
						<a href="http://localhost/">Game</a>
					</li>
					<li>
						<a href="http://localhost/user">User</a>
					</li>
					<li>
						<a href="http://localhost/social">Friends</a>
					</li>
				</ul>
				{/* Chat */}
				<a href="http://localhost/chat" className={classes.chat}>
					Chat
				</a>
			</div>
		</div>
	);
};

export default NavBar;
