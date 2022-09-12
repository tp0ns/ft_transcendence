import React, { useEffect, useState } from "react";
import { socket } from "../App";
import NavBar from "../components/NavBar/NavBar";
import classes from "./SocialPage.module.css";
import RelationsProp from "../interfaces/Relations.interface";
import RelationsList from "../components/social/RelationsList";
import { useCookies } from "react-cookie";
import jwtDecode, { JwtPayload } from "jwt-decode";
import Layout from "../components/Layout/Layout";

const SocialPage = () => {
  const [receivedRelations, setReceivedRelations] = useState<RelationsProp[]>(
    []
  );

  const [cookies] = useCookies();
   const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub as string;

  useEffect(() => {
    socket.emit("getRelations");
    socket.on("updatedRelations", () => {
      socket.emit("getRelations");
    })

    socket.on("sendRelations", (relations: RelationsProp[]) => {
      setReceivedRelations(relations)
    });
  }, []);

  const addFriend = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      socket.emit("addFriend", {username: event.target.value});
      event.target.value = "";
    }
  };

  return (
    <Layout>
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
        <RelationsList relations={receivedRelations} myId={clientId} />
      </div>
    </Layout>
  );
};

export default SocialPage;
