import classes from "./NormalMemberItem.module.css";
import UserProp from "../../../../interfaces/User.interface";

const NormalMemberItem: React.FC<{ member: UserProp }> = (props) => {
	return (
		<div className={classes.itemLayout}>
			<img
				src={
					props.member?.profileImage
						? props.member.profileImage
						: props.member?.image_url
				}
				alt="Avatar"
				className={classes.badge}
			/>
			<div className={classes.name}>{props.member.username}</div>
		</div>
	);
};

export default NormalMemberItem;
