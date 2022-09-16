import classes from "./GameScreen.module.css";

const HomeScreen: React.FC<{
  handleGame: (state: string) => void
}> = (props) => {

  const handleLocalGame = () => {
    props.handleGame("localGame");
  }

  const handleMatchMaking = () => {
    props.handleGame("matchGame");
  }

  return (
    <div className={classes.preGame}>
      <h1>Ready to play?</h1>
      <div className={classes.Buttons}>
        <button onClick={handleLocalGame}>Local Game</button>
        <button onClick={handleMatchMaking}>Match Making</button>
      </div>
    </div>
  );
};

export default HomeScreen;