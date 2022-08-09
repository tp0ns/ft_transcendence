import { HTMLAttributes } from "react";
import RelationsProp from "../../interfaces/Relations.interface";
import RelationItem from "./RelationItem";
import classes from "../../Pages/SocialPage.module.css";

const RelationsList: React.FC<{
  relations: RelationsProp[];
}> = (props) => {
  return (
    <div className={classes.relationsList}>
      {props.relations.map((relation) => (
        <RelationItem relation={relation} />
      ))}
    </div>
  );
};

export default RelationsList;
