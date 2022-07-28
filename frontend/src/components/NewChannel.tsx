import { useRef, useState } from "react";

import Card from "../ui/Card";
import classes from "./NewChannelForm.module.css";

function NewChannelForm(props: any) {
  const titleInputRef: any = useRef();
  const imageInputRef: any = useRef();
  const [privateChan, setPrivateChan] = useState(false);

  function submitHandler(event: any) {
    event.preventDefault();

    const enteredTitle = titleInputRef.current.value;
    const enteredImage = imageInputRef.current.value;

    const channelData = {
      title: enteredTitle,
      password: enteredImage,
      private: privateChan,
    };

    props.onAddChannel(channelData);
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
          <input type="text" required id="image" ref={imageInputRef} />
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
}

export default NewChannelForm;
