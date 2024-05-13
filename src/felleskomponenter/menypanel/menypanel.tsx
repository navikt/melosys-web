import { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { useFeatureToggle } from "../../featuretoggle";
import { skalViseIngenFlyt } from "../../url";
import Sidemeny from "../sidemeny";

import { mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelSelectors } from "../../ducks/menypanel";
import { fagsakSelectors } from "../../ducks/fagsaker";

import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";
import { LinkGroupsFactory } from "./linkgroups";
import "./menypanel.css";
import { MELOSYS_FTRL_IKKE_YRKESAKTIV } from "../../featuretoggle/toggleNavn";

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.mottatteopplysningertyper;

const mapStateToProps = (state: RootState) => ({
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  sakstema: fagsakSelectors.SakstemaKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  sisteOpplysningerHentetDato: behandlingerSelectors.SisteOpplysningerHentetDatoSelector(state),
  mottatteOpplysningerType: mottatteOpplysningerSelectors.MottatteOpplysningerTypeSelector(state),
  menypanel: menypanelSelectors.MenypanelSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type MenypanelProps = PropsFromRedux & {
  lagreSoknadOgOppfriskSaksopplysninger: (inkluderSiste5aar?: boolean) => void;
  visOppdaterRegisteropplysninger?: boolean;
};

export const Menypanel = ({
  sisteOpplysningerHentetDato,
  mottatteOpplysningerType,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  menypanel,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  visOppdaterRegisteropplysninger = true,
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);
  const [endreFokus, setEndreFokus] = useState(false);
  const ikkeYrkesaktivFtrlToggleEnabled = useFeatureToggle(MELOSYS_FTRL_IKKE_YRKESAKTIV);

  const visMottatteOpplysningerData = !(
    MKVUtils.erBehandlingAvSed(sakstype, behandlingstema) &&
    behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE
  );

  const contentProps = {
    visArbeidsforholdRolleEtiketter: mottatteOpplysningerType === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
    visMottatteOpplysningerData,
    behandlingstema,
    redigerbart,
    lagreSoknadOgOppfriskSaksopplysninger,
    endreFokus,
  };

  const linkGroupsWithContent = LinkGroupsFactory.createLinkGroups({
    sakstype,
    behandlingstema,
    behandlingstype,
    contentProps,
    mottatteOpplysningerType,
    sakstema,
    ikkeYrkesaktivFtrlToggleEnabled,
  });

  const linkGroups = linkGroupsWithContent.map((linkGroup, groupIndex) => ({
    label: linkGroup.label,
    links: linkGroup.links.map((link, linkIndex) => ({
      label: link.label,
      active: groupIndex === activeGroupIndex && linkIndex === activeLinkIndex,
    })),
  }));

  const activeLink =
    linkGroupsWithContent.length !== 0 ? linkGroupsWithContent[activeGroupIndex].links[activeLinkIndex] : null;

  useEffect(() => {
    if (endreFokus && activeLink) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId(activeLink.label);
      setEndreFokus(false);
    }
  }, [activeLink]);

  const handleClick = (groupIndex: number, linkIndex: number) => {
    setActive([groupIndex, linkIndex]);
    setEndreFokus(true);
  };
  const visMenypanel =
    (sakstype === MKV.Koder.sakstyper.EU_EOS &&
      behandlingstema !== MKV.Koder.behandlinger.behandlingstema.A1_ANMODNING_OM_UNNTAK_PAPIR &&
      behandlingstema !== MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV) ||
    menypanel?.synlig ||
    skalViseIngenFlyt(sakstype, sakstema, behandlingstema, behandlingstype, ikkeYrkesaktivFtrlToggleEnabled);

  if (!visMenypanel) return null;
  return (
    <>
      {visOppdaterRegisteropplysninger && redigerbart && (
        <OppdaterRegisteropplysninger
          sistOppdatert={Utils.dato.formatterDatoTilNorsk(sisteOpplysningerHentetDato)}
          oppdaterRegisteropplysninger={lagreSoknadOgOppfriskSaksopplysninger}
          sakstype={sakstype}
        />
      )}
      <div className="menypanel">
        <Nav.Column xs="3" className="utenPadding">
          <Sidemeny heading="Opplysninger" linkGroups={linkGroups} onClick={handleClick} />
        </Nav.Column>
        <Nav.Column xs="9" className="utenPadding">
          <aside>
            <div className="panel" id={activeLink?.label}>
              {activeLink?.content || <div />}
            </div>
          </aside>
        </Nav.Column>
      </div>
    </>
  );
};

export default connector(Menypanel);
