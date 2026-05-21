import { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { DokumentOversikt, FysiskDokument } from "Domene";
import { Tabs } from "@navikt/ds-react";
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

import "./sideDialog.less";

export interface FaneViserProps {
  navn: string;
  saksnummer: string;
  sakstype: string;
  behandlingID: number;
  behandlingstema: string;
  redigerbart: boolean;
  dokumentOversikt: DokumentOversikt[];
  dokumenter: FysiskDokument[];
  setAktivTab: (fanenavn: string) => void;
}

export function FaneViser({
  navn,
  behandlingID,
  behandlingstema,
  saksnummer,
  sakstype,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  setAktivTab,
}: FaneViserProps) {
  switch (navn) {
    case "dokumenter":
      return (
        <SideDialogDokumenter
          behandlingID={behandlingID}
          dokumentOversikt={dokumentOversikt}
          setAktivTab={setAktivTab}
        />
      );
    case "brevbestilling":
      return <SideDialogSendBrev behandlingID={behandlingID} redigerbart={redigerbart} dokumenter={dokumenter} />;
    case "sedbestilling":
      return (
        <SideDialogOpprettNyBuc
          behandlingID={behandlingID}
          behandlingstema={behandlingstema}
          sakstype={sakstype}
          dokumenter={dokumenter}
          redigerbart={redigerbart}
        />
      );
    case "besvarsed":
      return <SideDialogBesvarSed behandlingID={behandlingID} />;
    case "notat":
      return <SideDialogNotater saksnummer={saksnummer} redigerbart={redigerbart} />;
    default:
      throw new Error("Navn er en påkrevd prop");
  }
}

interface Tab {
  navn: string;
  tittel: string;
}

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
  tabs?: Tab[];
}

function SideDialog({
  behandlingID,
  behandlingstema,
  saksnummer,
  sakstype,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  tabs = defaultTabs,
}: SideDialogProps & PropsFromRedux) {
  const [aktivTab, setAktivTab] = useState<string>(tabs[0].navn);
  const [endreFokus, setEndreFokus] = useState(false);

  useEffect(() => {
    if (endreFokus) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId(aktivTab);
      setEndreFokus(false);
    }
  }, [aktivTab]);

  return (
    <div className="dialog">
      <aside>
        <Tabs value={aktivTab} onChange={setAktivTab} size="small">
          <nav>
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Tab key={Utils._uuid()} value={tab.navn} label={tab.tittel} />
              ))}
            </Tabs.List>
          </nav>
          {tabs.map((tab) => (
            <Tabs.Panel value={tab.navn} key={tab.navn}>
              <FaneViser
                navn={tab.navn}
                saksnummer={saksnummer}
                sakstype={sakstype}
                behandlingID={behandlingID}
                behandlingstema={behandlingstema}
                redigerbart={redigerbart}
                dokumentOversikt={dokumentOversikt}
                dokumenter={dokumenter}
                setAktivTab={setAktivTab}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </aside>
    </div>
  );
}

export const defaultTabs: Tab[] = [
  { navn: "dokumenter", tittel: "Dokumenter" },
  { navn: "notat", tittel: "Behandlingsnotat" },
  { navn: "brevbestilling", tittel: "Send brev" },
  { navn: "sedbestilling", tittel: "Opprett ny BUC" },
  { navn: "besvarsed", tittel: "SED-utveksling" },
];

export const tabsUtenBucOgSed: Tab[] = [
  { navn: "dokumenter", tittel: "Dokumenter" },
  { navn: "notat", tittel: "Behandlingsnotat" },
  { navn: "brevbestilling", tittel: "Send brev" },
];

export default connector(SideDialog);
