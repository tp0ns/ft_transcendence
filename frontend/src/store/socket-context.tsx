import React, { ReactNode } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = React.createContext(io("http://localhost"));
