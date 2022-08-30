import { useContext, useState } from "react";
import ChatContext from "../../../context/chat-context";
import UserProp from "../../../interfaces/User.interface";
import AdminMemberItem from "./AdminMemberItem/AdminMemberItem";
import classes from "./MemberList.module.css";
import NormalMemberItem from "./NormalMemberItem/NormalMemberItem";

function MemberList() {
	const ctx = useContext(ChatContext);

	function excludeAdmins(): UserProp[] {
		var result = ctx?.activeChan?.members.filter((member) => {
			return !ctx.activeChan?.admins.some((admin) => {
				return member.userId === admin.userId; // return the ones with equal id
			});
		});
		return result as UserProp[];
	}

	return (
		<div className={classes.layout}>
			<div className={classes.category}>Admins</div>
			{ctx?.activeChan?.admins.map((admin) => {
				return <NormalMemberItem key={admin.userId} member={admin} />;
			})}
			<div className={classes.category}>Members</div>
			{excludeAdmins().map((member) => {
				if (!ctx?.isAdmin)
					return <NormalMemberItem key={member.userId} member={member} />;
				return <AdminMemberItem key={member.userId} member={member} />;
			})}
		</div>
	);
}

export default MemberList;
