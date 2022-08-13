import NavBar from "../NavBar/NavBar";
import classes from "./Layout.module.css";

const Layout: React.FC<{ children: JSX.Element }> = (props) => {
	return (
		<div className={classes.layout}>
			<NavBar />
			{props.children}
		</div>
	);
};

export default Layout;
