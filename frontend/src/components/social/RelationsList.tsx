import RelationsProp from "../../interfaces/Relations.interface";
import RelationItem from "./RelationItem";
import classes from "../../Pages/SocialPage.module.css";

const RelationsList: React.FC<{
  relations: RelationsProp[];
  myId: string;
}> = (props) => {
  console.log("relations: ", props.relations);
  console.log("myId: ", props.myId)
  return (
    <div className={classes.relationsList}>
      {props.relations.map((relation) => (
        <RelationItem relation={relation} myId={props.myId} key={props.myId}/>
      ))}
    </div>
  );
};

export default RelationsList;
