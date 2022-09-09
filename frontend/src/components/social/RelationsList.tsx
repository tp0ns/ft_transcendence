import RelationsProp from "../../interfaces/Relations.interface";
import RelationItem from "./RelationItem";
import classes from "../../Pages/SocialPage.module.css";

const RelationsList: React.FC<{
  relations: RelationsProp[];
  myId: string;
}> = (props) => {
  return (
    <div className={classes.relationsList}>
      {props.relations.map((relation) => (
        <RelationItem relation={relation} myId={props.myId} key={relation.requestId}/>
      ))}
    </div>
  );
};

export default RelationsList;
