import classes from "./LoginPage.module.css";

const LoginPage = () => {
	return (
		<div className={classes.login}>
			<div className={classes.login_logo}>
				<div>P</div>
				<div className={classes.o}>O</div>
				<div>NG</div>
			</div>
			<a href="/backend/auth/login" className={classes.login_school}>
				<p>Connect with</p>
				<img src="//42_Logo.png" alt="42 school logo" />
			</a>
		</div>
	);
};

export default LoginPage;
