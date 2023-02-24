import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import classnames from "classnames";
import { DokumentOversikt, FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterSelectors } from "../../ducks/dokumenter";
import { fagsakSelectors } from "../../ducks/fagsaker";

import SideDialogSendBrev from "./sendBrev";
import SideDialogOpprettNyBuc from "./sideDialogOpprettNyBuc";
import SideDialogDokumenter from "./sideDialogDokumenter";
import SideDialogBesvarSed from "./sideDialogBesvarSed";
import SideDialogNotater from "./sideDialogNotater";

import "./sideDialog.css";

export type FaneNavn = "sedbestilling" | "dokumenter" | "notat" | "brevbestilling" | "besvarsed";

export interface FaneViserProps {
  navn: FaneNavn;
  saksnummer: string;
  sakstype: string;
  behandlingID: number;
  behandlingstema: string;
  redigerbart: boolean;
  dokumentOversikt: DokumentOversikt[];
  dokumenter: FysiskDokument[];
  endreFane: (fanenavn: FaneNavn) => void;
}

export const FaneViser = ({
  navn,
  behandlingID,
  behandlingstema,
  saksnummer,
  sakstype,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  endreFane,
}: FaneViserProps) => {
  switch (navn) {
    case "dokumenter":
      return (
        <SideDialogDokumenter behandlingID={behandlingID} dokumentOversikt={dokumentOversikt} endreFane={endreFane} />
      );
    case "brevbestilling":
      return (
        <SideDialogSendBrev
          behandlingID={behandlingID}
          saksnummer={saksnummer}
          redigerbart={redigerbart}
          visApneINyttVindu
          dokumenter={dokumenter}
        />
      );
    case "sedbestilling":
      return (
        <SideDialogOpprettNyBuc
          behandlingID={behandlingID}
          behandlingstema={behandlingstema}
          sakstype={sakstype}
          dokumenter={dokumenter}
        />
      );
    case "besvarsed":
      return <SideDialogBesvarSed behandlingID={behandlingID} />;
    case "notat":
      return <SideDialogNotater saksnummer={saksnummer} redigerbart={redigerbart} />;
    default:
      throw new Error("Navn er en påkrevd prop");
  }
};

type Fane = { navn: FaneNavn; tittel: string };

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface SideDialogProps {
  faner?: Fane[];
}

const SideDialog = ({
  behandlingID,
  behandlingstema,
  saksnummer,
  sakstype,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  faner = defaultFaner,
}: SideDialogProps & PropsFromRedux) => {
  const [aktivFane, setAktivFane] = useState<FaneNavn>(faner[0].navn);
  const [endreFokus, setEndreFokus] = useState(false);

  useEffect(() => {
    if (endreFokus) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId(aktivFane);
      setEndreFokus(false);
    }
  }, [aktivFane]);

  const endreFane = (fanenavn: FaneNavn) => {
    setAktivFane(fanenavn);
    setEndreFokus(true);
  };

  return (
    <div className="dialog panelSeksjon">
      <Nav.Panel>
        <div className="dialog__meny" role="navigation">
          {faner.map((fane) => (
            <button
              className={classnames({ meny__element: true, "meny__element--aktiv": fane.navn === aktivFane })}
              key={Utils._uuid()}
              onClick={() => endreFane(fane.navn)}
              type="button"
            >
              {fane.tittel}
            </button>
          ))}
        </div>
        <div id={aktivFane}>
          <FaneViser
            navn={aktivFane}
            behandlingID={behandlingID}
            behandlingstema={behandlingstema}
            saksnummer={saksnummer}
            sakstype={sakstype}
            redigerbart={redigerbart}
            dokumentOversikt={dokumentOversikt}
            dokumenter={dokumenter}
            endreFane={endreFane}
          />
        </div>
      </Nav.Panel>
    </div>
  );
};

export const defaultFaner: Fane[] = [
  { navn: "dokumenter", tittel: "Dokumenter" },
  { navn: "notat", tittel: "Behandlingsnotat" },
  { navn: "brevbestilling", tittel: "Send brev" },
  { navn: "sedbestilling", tittel: "Opprett ny BUC" },
  { navn: "besvarsed", tittel: "SED-utveksling" },
];

export const fanerUtenBucOgSed: Fane[] = [
  { navn: "dokumenter", tittel: "Dokumenter" },
  { navn: "notat", tittel: "Behandlingsnotat" },
  { navn: "brevbestilling", tittel: "Send brev" },
];

export default connector(SideDialog);
