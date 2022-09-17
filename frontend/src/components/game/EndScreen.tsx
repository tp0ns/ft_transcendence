import { socket } from "../../App";
import classes from "./GameScreen.module.css";

const EndScreen: React.FC<{
  winner: string,
  handleGame: (state: string) => void
}> = (props) => {

  const handleBackHome = (event: any) => {
    window.location.reload();
    // socket.disconnect()
    // props.handleGame("noGame");
  }

  return (
    <div className={classes.preGame}>
      <h1>There is a winner!!!</h1>
      <h2>{props.winner}</h2>
      <div className={classes.Buttons}>
        <button onClick={handleBackHome}>Back Home</button>
      </div>
    </div>
  );
};

export default EndScreen;