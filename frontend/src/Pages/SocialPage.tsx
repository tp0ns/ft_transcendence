import React from "react";
import { classicNameResolver } from "typescript";
import NavBar from "../components/NavBar/NavBar";
import classes from "./SocialPage.module.css";

const SocialPage = () => {
  return (
    <React.Fragment>
      <NavBar />
      <div className={classes.parent}>
        <div className={classes.searchBar}>
          <img src="search.svg" className={classes.searchLogo} />
          <input className={classes.input} placeholder="Add a new friend" />
        </div>
        <div className={classes.friendsTitle}>
          <h1>Friends List</h1>
        </div>
        {/* <FriendsList /> */}
      </div>
    </React.Fragment>
  );
};

export default SocialPage;
