import { HTMLAttributes } from "react";
import RelationsProp from "../../interfaces/Relations.interface";
import RelationItem from "./RelationItem";
import classes from "../../Pages/SocialPage.module.css";
import UserProp from "../../interfaces/User.interface";

const RelationsList: React.FC<{
  relations: RelationsProp[];
  myId: string;
}> = (props) => {
  return (
    <div className={classes.relationsList}>
      {props.relations.map((relation) => (
        <RelationItem relation={relation} myId={props.myId} />
      ))}
    </div>
  );
};

export default RelationsList;
