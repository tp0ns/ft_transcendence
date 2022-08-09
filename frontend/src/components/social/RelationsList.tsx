import RelationsProp from "../../interfaces/Relations.interface";
import RelationItem from "./RelationItem";

const RelationsList: React.FC<{ relations: RelationsProp[] }> = (props) => {
  return (
    <div>
      {props.relations.map((relation) => (
        <RelationItem relation={relation} />
      ))}
    </div>
  );
};

export default RelationsList;
