import { ElementType, ReactNode } from "react";
import * as Nav from "../../navFrontend";
import "./panelHeader.css";

interface PanelHeaderProps {
  tittel: string;
  ikon?: ElementType;
  undertittel?: ReactNode | string;
}

const PanelHeader = ({ ikon: Ikon, tittel, undertittel = "" }: PanelHeaderProps) => (
  <div className="panelheader">
    {Ikon && <Ikon className="panelheader__ikon" />}
    <div className="panelheader__tittel">
      <div className="panelheader__tittel__hoved">
        <Nav.Heading size="xsmall">{tittel}</Nav.Heading>&emsp;
      </div>
      <span className="panelheader__tittel__under">{undertittel}</span>
    </div>
  </div>
);

export default PanelHeader;
