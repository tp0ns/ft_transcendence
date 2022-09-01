import Layout from "../../components/Layout/Layout";
import UserContent from "../../components/user/UserContent/UserContent";

const UserPage: React.FC<{ userId: string }> = (props) => {
	return (
		<Layout>
			<UserContent userId={props.userId} />
		</Layout>
	);
};

export default UserPage;
