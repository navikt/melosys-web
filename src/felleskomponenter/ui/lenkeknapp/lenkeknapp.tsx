import React, { MouseEventHandler } from "react";

import "./lenkeknapp.css";

interface LenkeknappProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

const Lenkeknapp = ({ onClick, children }: LenkeknappProps) => {
  return (
    <button onClick={onClick} className="lenkeknapp">
      {children}
    </button>
  );
};

export default Lenkeknapp;
