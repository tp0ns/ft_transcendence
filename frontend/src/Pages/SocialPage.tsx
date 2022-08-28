import React, { useEffect, useState } from "react";
import { socket } from "../App";
import NavBar from "../components/NavBar/NavBar";
import classes from "./SocialPage.module.css";
import RelationsProp from "../interfaces/Relations.interface";
import RelationsList from "../components/social/RelationsList";

const SocialPage = () => {
  const [receivedRelations, setReceivedRelations] = useState<RelationsProp[]>(
    []
  );

  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    console.log("entered initial useEffect");
    socket.emit("getRelations");
    socket.on("sendRelations", (relations) => {
      console.log("SENDRELATIONS received relations: ", receivedRelations)
      setReceivedRelations(relations)});

    fetch("http://localhost/backend/users/me")
      .then((response) => response.json())
      .then((data) => {
        setMyId(data.userId);
      });
  }, []);

  const addFriend = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("entered enter!!!");
      socket.emit("addFriend", event.target.value);
      event.target.value = "";
    }
  };

  return (
    <React.Fragment>
      <NavBar />
      <div className={classes.parent}>
        <div className={classes.searchBar}>
          <img src="search.svg" alt="searchLogo" className={classes.searchLogo} />
          <input
            tabIndex={0}
            className={classes.input}
            placeholder="Add a new friend"
            onKeyDown={addFriend}
          />
        </div>
        <h1 className={classes.friendsTitle}>Friends List</h1>
        <RelationsList relations={receivedRelations} myId={myId} />
      </div>
    </React.Fragment>
  );
};

export default SocialPage;
