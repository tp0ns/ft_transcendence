import ChannelProp from "../../interfaces/Channel.interface";
import classes from "./NewChannelForm.module.css";

// Change password if Owner
// Change Admins if Owner
// Add members if private Chan and everyone

const Settings: React.FC<{ channel: ChannelProp }> = (props) => {
  return (
    <div>
      <h1>CACA!!!!!</h1>
      <p>
        Soyez patients putain, trop de pression dans ce groupe j'en peux plus.
        C'est etoufant.
      </p>
    </div>
    // <div className={classes.control}>
    //       <button onClick={handlePassword}>
    //         {!protectedChan ? "Protect" : "Unprotect"}
    //       </button>
    //     </div>
    //     {protectedChan ? (
    //       <div className={classes.control}>
    //         <label htmlFor="image">Channel Password</label>
    //         <input type="text" required id="image" ref={passwordInputRef} />
    //       </div>
  );
};

export default Settings;
