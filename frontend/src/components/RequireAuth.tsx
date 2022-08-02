import { useLocation, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import jwtDecode from "jwt-decode";

const RequireAuth: React.FC<{ children: JSX.Element }> = (props) => {
	const [cookies, setCookie] = useCookies();
	let location = useLocation();

	if (!cookies.Authentication) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	const token: any = jwtDecode(cookies.Authentication);
	const dateNow = new Date();
	if (token.exp * 1000 < dateNow.getTime()) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	return <div>{props.children}</div>;
};

export default RequireAuth;
