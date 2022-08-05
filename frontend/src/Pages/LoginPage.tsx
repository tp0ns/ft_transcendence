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
		<div>
			<div>Logo</div>
			<a href="http://localhost/backend/auth/login">Connect with 42</a>
		</div>
	);
};

export default LoginPage;
