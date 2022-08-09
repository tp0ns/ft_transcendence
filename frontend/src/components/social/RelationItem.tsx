import { classicNameResolver } from "typescript";
import RelationsProp from "../../interfaces/Relations.interface";
import classes from "../../Pages/SocialPage.module.css";

const RelationItem: React.FC<{ relation: RelationsProp }> = (props) => {
  return (
    <div className={classes.relationItem}>
      <h1>{props.relation.creator?.username}</h1>
      <h1>{props.relation.receiver?.username}</h1>
    </div>
  );
};

export default RelationItem;
