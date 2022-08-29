import classes from "./AdminMemberItem.module.css";
import UserProp from "../../../../interfaces/User.interface";
import { useState } from "react";

const AdminMemberItem: React.FC<{ member: UserProp }> = (props) => {
	const [itemSide, setItemSide] = useState<boolean>(false);

	function changeItemSide() {
		setItemSide((prev) => {
			return !prev;
		});
	}

	if (itemSide)
		return (
			<div
				className={classes.itemFlipLayout}
				onClick={() => {
					changeItemSide();
				}}
			>
				Settings
			</div>
		);
	return (
		<div
			className={classes.itemLayout}
			onClick={() => {
				changeItemSide();
			}}
		>
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

export default AdminMemberItem;
