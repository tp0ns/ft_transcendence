import { useLocation, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import jwtDecode from "jwt-decode";

const RequireAuth: React.FC<{ children: JSX.Element }> = (props) => {
	const [cookies] = useCookies();
	let location = useLocation();

	if (!cookies.Authentication) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	const token: any = jwtDecode(cookies.Authentication);
	const dateNow = new Date();
	if (token.exp * 1000 < dateNow.getTime()) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	if (
		location.pathname !== "/2fa" &&
		token.isSecondFactorAuthenticated === false
	) {
		return <Navigate to="/2fa" state={{ from: location }} replace />;
	}
	if (
		location.pathname === "/2fa" &&
		token.isSecondFactorAuthenticated === true
	) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}
	return <div>{props.children}</div>;
};

export default RequireAuth;
