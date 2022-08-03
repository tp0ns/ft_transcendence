import React, { ReactNode, useState } from "react";
import ChannelProp from "../interfaces/Channel.interface";
import Channel from "../models/channel";

type ChannelsContextObj = {
  items: Channel[];
  addChannel: (input: ChannelProp) => void;
  removeChannel: (id: string) => void;
};

export const ChannelsContext = React.createContext<ChannelsContextObj>({
  items: [],
  addChannel: () => {},
  removeChannel: (id: string) => {},
});

const ChannelsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);

  const addChannelHandler = (channelInput: ChannelProp) => {
    const newChannel = new Channel(channelInput);

    setChannels((prevChannels) => {
      return prevChannels.concat(newChannel);
    });
  };

  const removeChannelsHandler = (channelId: string) => {
    setChannels((prevChannels) => {
      return prevChannels.filter((channel) => channel.id !== channelId);
    });
  };

  const contextValue: ChannelsContextObj = {
    items: channels,
    addChannel: addChannelHandler,
    removeChannel: removeChannelsHandler,
  };

  return (
    <ChannelsContext.Provider value={contextValue}>
      {children}
    </ChannelsContext.Provider>
  );
};

export default ChannelsContextProvider;
