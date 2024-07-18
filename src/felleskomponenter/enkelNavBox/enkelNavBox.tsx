import { ReactNode } from "react";
import * as Nav from "../../navFrontend";
import "./enkelNavBox.css";

interface EnkelNavBoxProps {
  focused: boolean;
  children: ReactNode;
}

// Denne brukes nå i journalføring og opprett ny sak
const EnkelNavBox = ({ focused, children }: EnkelNavBoxProps) => {
  return (
    <Nav.Box
      padding="3"
      borderWidth="1"
      borderRadius="small"
      borderColor="border-default"
      className={`radioKnappRamme ${focused && "focused"}`}
    >
      {children}
    </Nav.Box>
  );
};

export default EnkelNavBox;
