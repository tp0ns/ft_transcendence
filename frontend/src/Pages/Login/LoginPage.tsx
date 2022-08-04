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
			<a
				href="http://localhost/backend/auth/login"
				className={classes.login_school}
			>
				<p>Connect with</p>
				<img src="/42_Logo.png" alt="42 school logo" />
			</a>
		</div>
	);
};

export default LoginPage;
