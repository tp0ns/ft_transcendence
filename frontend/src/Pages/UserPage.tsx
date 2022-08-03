import React from "react";
import ReactDOM from "react-dom";
import NavBar from "../components/NavBar/NavBar";

const UserPage = () => {
	return (
		<React.Fragment>
			{ReactDOM.createPortal(
				<NavBar />,
				document.getElementById("navbar-root") as Element
			)}
			<div>User ici</div>
		</React.Fragment>
	);
};

export default UserPage;
