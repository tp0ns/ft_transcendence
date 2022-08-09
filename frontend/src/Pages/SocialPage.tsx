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

  useEffect(() => {
    socket.emit("getRelations");
    socket.on("sendRelations", (relations) => setReceivedRelations(relations));
  }, []);

  socket.on("updatedRelations", () => {
    socket.emit("getRelations");
    socket.on("sendRelations", (relations) => setReceivedRelations(relations));
  });

  const addFriend = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Entered add friend front");
    if (event.key === "Enter") {
      event.preventDefault();
      socket.emit("addFriend", event.target.value);
      event.target.value = "";
    }
  };

  return (
    <React.Fragment>
      <NavBar />
      <div className={classes.parent}>
        <div className={classes.searchBar}>
          <img src="search.svg" className={classes.searchLogo} />
          <input
            tabIndex={0}
            className={classes.input}
            placeholder="Add a new friend"
            onKeyDown={addFriend}
          />
        </div>
        <h1 className={classes.friendsTitle}>Friends List</h1>
        <RelationsList relations={receivedRelations} />
      </div>
    </React.Fragment>
  );
};

export default SocialPage;
