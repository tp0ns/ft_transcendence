import { useEffect, useState } from "react";
import { classicNameResolver, isPropertySignature } from "typescript";
import RelationsProp from "../../interfaces/Relations.interface";
import UserProp from "../../interfaces/User.interface";
import classes from "../../Pages/SocialPage.module.css";

const RelationItem: React.FC<{
  relation: RelationsProp;
  myId: string;
}> = (props) => {
  const [toDisplay, setToDisplay] = useState<UserProp>();

  useEffect(() => {
    if (props.relation.creator?.userId === props.myId)
      setToDisplay(props.relation.receiver);
    else setToDisplay(props.relation.creator);
  }, []);

  return (
    <div className={classes.relationItem}>
      <div className={classes.leftSide}>
        <img src={toDisplay?.image_url} className={classes.img}></img>
        <h3>{toDisplay?.username}</h3>
      </div>
    </div>
  );
};

export default RelationItem;
