import React, { useRef } from "react";

const InputAndButton: React.FC<{
  buttonName: string;
  capturedInfo: (inputString: string) => void;
}> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    props.capturedInfo(inputRef.current!.value);
  };

  return (
    <div>
      <input ref={inputRef}></input>
      <button onClick={handleClick}>{props.buttonName}</button>
    </div>
  );
};

export default InputAndButton;
