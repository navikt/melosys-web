import * as Nav from "../../navFrontend";

import "./labelMedHjelpetekst.css";

interface LabelMedHjelpetekstProps {
  label: string;
  hjelpetekst?: string | null;
  bold?: boolean;
  undertittel?: boolean;
  small?: boolean;
  placement?:
    | "top"
    | "bottom"
    | "right"
    | "left"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "right-start"
    | "right-end"
    | "left-start"
    | "left-end";
}

function LabelMedHjelpetekst({
  label,
  hjelpetekst,
  undertittel,
  placement = "top",
  bold,
  small,
}: LabelMedHjelpetekstProps) {
  return (
    <div className="labelMedHjelpetekst__wrapper">
      {undertittel ? (
        <Nav.Heading size="xsmall" className="undertittel">
          {label}
        </Nav.Heading>
      ) : (
        <span className={small ? "small" : undefined}>{bold ? <b>{label}</b> : label}</span>
      )}
      {hjelpetekst && (
        <Nav.HelpText title={`${label} hjelpetekst`} placement={placement} className="labelMedHjelpetekst__hjelpetekst">
          {hjelpetekst}
        </Nav.HelpText>
      )}
    </div>
  );
}

export default LabelMedHjelpetekst;
