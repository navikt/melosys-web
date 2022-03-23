import React, { useState } from "react";
import classnames from "classnames";
import PT from "prop-types";
import { DokumentOversikt, FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import SideDialogSendBrev from "./sendBrev";
import SideDialogOpprettNyBuc from "./sideDialogOpprettNyBuc";
import SideDialogDokumenter from "./sideDialogDokumenter";
import SideDialogBesvarSed from "./sideDialogBesvarSed";
import SideDialogNotater from "./sideDialogNotater/sideDialogNotater";

import "./sideDialog.css";

type FaneNavn = "sedbestilling" | "dokumenter" | "notat" | "brevbestilling" | "besvarsed";

export interface FaneViserProps {
  navn: FaneNavn;
  saksnummer: string;
  behandlingID: number;
  redigerbart: boolean;
  dokumentOversikt: DokumentOversikt[];
  dokumenter: FysiskDokument[];
}

export const FaneViser = ({
  navn,
  behandlingID,
  saksnummer,
  redigerbart,
  dokumentOversikt,
  dokumenter,
}: FaneViserProps) => {
  switch (navn) {
    case "dokumenter":
      return <SideDialogDokumenter dokumentOversikt={dokumentOversikt} />;
    case "brevbestilling":
      return <SideDialogSendBrev behandlingID={behandlingID} redigerbart={redigerbart} />;
    case "sedbestilling":
      return <SideDialogOpprettNyBuc behandlingID={behandlingID} dokumenter={dokumenter} />;
    case "besvarsed":
      return <SideDialogBesvarSed behandlingID={behandlingID} />;
    case "notat":
      return <SideDialogNotater saksnummer={saksnummer} redigerbart={redigerbart} />;
    default:
      throw new Error("Navn er en påkrevd prop");
  }
};

type Fane = { navn: FaneNavn; tittel: string };

interface SideDialogProps {
  faner?: Fane[];
  saksnummer: string;
  behandlingID: number;
  redigerbart: boolean;
  dokumentOversikt: DokumentOversikt[];
  dokumenter: FysiskDokument[];
}

const SideDialog = ({
  behandlingID,
  saksnummer,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  faner = [],
}: SideDialogProps) => {
  const [aktivFane, setAktivFane] = useState<FaneNavn>(faner[0].navn);

  return (
    <div className="dialog panelSeksjon">
      <Nav.Panel>
        <div className="dialog__meny" role="navigation">
          {faner.map((fane) => (
            <button
              className={classnames({ meny__element: true, "meny__element--aktiv": fane.navn === aktivFane })}
              key={Utils._uuid()}
              onClick={() => setAktivFane(fane.navn)}
              type="button"
            >
              {fane.tittel}
            </button>
          ))}
        </div>
        <div>
          <FaneViser
            navn={aktivFane}
            behandlingID={behandlingID}
            saksnummer={saksnummer}
            redigerbart={redigerbart}
            dokumentOversikt={dokumentOversikt}
            dokumenter={dokumenter}
          />
        </div>
      </Nav.Panel>
    </div>
  );
};

SideDialog.propTypes = {
  faner: PT.arrayOf(PT.object),
  saksnummer: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  dokumentOversikt: PT.arrayOf(PT.object).isRequired,
  dokumenter: PT.arrayOf(PT.object).isRequired,
};

SideDialog.defaultProps = {
  faner: [
    { navn: "dokumenter", tittel: "Dokumenter" },
    { navn: "notat", tittel: "Notat" },
    { navn: "brevbestilling", tittel: "Send brev" },
    { navn: "sedbestilling", tittel: "Opprett ny BUC" },
    { navn: "besvarsed", tittel: "SED-utveksling" },
  ],
};

export default SideDialog;
