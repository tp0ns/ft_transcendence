import classes from "./LoginPage.module.css";

const LoginPage = () => {
	// async function connectSchool() {
	// 	try {
	// 		const response = await fetch("http://localhost/backend/auth/login", {
	// 			method: "GET",
	// 			headers: {},
	// 			body: null,
	// 		});
	// 		if (!response.ok) {
	// 			throw new Error("Request failed!");
	// 		}
	// 	} catch (err) {}
	// }

	return (
		<div className={classes.login}>
			<div className={classes.login_logo}>PONG</div>
			<div className={classes.login_list}>
				<a
					href="http://localhost/backend/auth/login"
					className={classes.login_school}
				>
					<div className={classes.login_school_button}>
						<div>Connect with</div>
						<img src="/42_Logo.png" alt="42 school logo" />
					</div>
				</a>
			</div>
		</div>
	);
};

export default LoginPage;
