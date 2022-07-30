import { useContext, useRef, useState } from "react";
import ChannelProp from "../interfaces/Channel.interface";
import { ChannelsContext } from "../store/channels-context";

import Card from "../ui/Card";
import classes from "./NewChannelForm.module.css";

const NewChannelForm: React.FC<{
  sendChan: (channelData: ChannelProp) => void;
}> = (props: any) => {
  const channelsCtx = useContext(ChannelsContext);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [privateChan, setPrivateChan] = useState(false);

  function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const enteredTitle: string = titleInputRef.current!.value;
    const enteredImage: string = passwordInputRef.current!.value;

    const channelData = {
      id: "",
      title: enteredTitle,
      password: enteredImage,
      private: privateChan,
    };
    // channelsCtx.addChannel(channelData);
    console.log(channelData);
    props.sendChan(channelData);
  }

  function handlePrivate(event: any) {
    event.preventDefault();
    setPrivateChan(true);
  }

  return (
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="title">Channel Title</label>
          <input type="text" required id="title" ref={titleInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="image">Channel Password</label>
          <input type="text" required id="image" ref={passwordInputRef} />
        </div>
        <div className={classes.control}>
          <button onClick={handlePrivate}>Make private</button>
        </div>
        <div className={classes.actions}>
          <button>Add Channel</button>
        </div>
      </form>
    </Card>
  );
};

export default NewChannelForm;
