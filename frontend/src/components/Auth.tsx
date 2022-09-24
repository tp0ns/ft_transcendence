import { useLocation, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import jwtDecode from "jwt-decode";
import React, { useEffect } from "react";
import { ErrorContextProvider } from "../context/error-context";
import { socket } from "../App";

const Auth: React.FC<{ children: JSX.Element }> = (props) => {
	const [cookies] = useCookies();
	const location = useLocation();

	useEffect(() => {
		if (location.pathname != "/game" && location.pathname != "/waiting") {
			console.log("changedTab");
			socket.emit("changedTab");
		}
	}, [location]);

	if (!cookies.Authentication) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	const token: any = jwtDecode(cookies.Authentication);
	const dateNow = new Date();
	if (token.exp * 1000 < dateNow.getTime()) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	if (location.pathname !== "/2fa" && token.twoFAAuthenticated === false) {
		return <Navigate to="/2fa" state={{ from: location }} replace />;
	}
	if (location.pathname === "/2fa" && token.twoFAAuthenticated === true) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}
	return <ErrorContextProvider>{props.children}</ErrorContextProvider>;
};

export default Auth;
