import RelationsProp from "../../interfaces/Relations.interface";

const RelationItem: React.FC<{ relation: RelationsProp }> = (props) => {
  return (
    <div>
      <h1>{props.relation.creator?.username}</h1>
      <h1>{props.relation.receiver?.username}</h1>
    </div>
  );
};

export default RelationItem;
