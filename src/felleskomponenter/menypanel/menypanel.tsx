import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import { formatterDatoTilNorsk } from "../../utils/dato";

import Sidemeny from "../sidemeny";

import { mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelSelectors } from "../../ducks/menypanel";
import { fagsakSelectors } from "../../ducks/fagsaker";

import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";
import { LinkGroupsFactory } from "./linkgroups";
import "./menypanel.css";

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.mottatteopplysningertyper;

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  sisteOpplysningerHentetDato: behandlingerSelectors.SisteOpplysningerHentetDatoSelector(state),
  mottatteOpplysningerType: mottatteOpplysningerSelectors.MottatteOpplysningerTypeSelector(state),
  visMenypanel: menypanelSelectors.ErMenypanelSynlig(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
  sakstema: fagsakSelectors.SakstemaKodeSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type MenypanelProps = PropsFromRedux & {
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  visOppdaterRegisteropplysninger?: boolean;
};

export const Menypanel = ({
  sisteOpplysningerHentetDato,
  mottatteOpplysningerType,
  sakstype,
  behandlingstema,
  behandlingstype,
  visMenypanel,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  visOppdaterRegisteropplysninger = true,
  sakstema,
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);
  const [menypanelFeilmelding, setMenypanelFeilmelding] = useState("");

  if (!visMenypanel) return null;

  const contentProps = {
    visArbeidsforholdRolleEtiketter: mottatteOpplysningerType === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
    visMottatteOpplysningerData: !(
      behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SED &&
      behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE
    ),
    behandlingstema,
    redigerbart,
    lagreSoknadOgOppfriskSaksopplysninger,
    setMenypanelFeilmelding,
  };

  const linkGroupsWithContent = LinkGroupsFactory.createLinkGroups({
    sakstype,
    behandlingstema,
    behandlingstype,
    contentProps,
    mottatteOpplysningerType,
    sakstema,
  });

  const handleClick = (groupIndex: number, linkIndex: number) => {
    setActive([groupIndex, linkIndex]);
    setMenypanelFeilmelding("");
  };

  const activeContent =
    linkGroupsWithContent.length !== 0 ? linkGroupsWithContent[activeGroupIndex].links[activeLinkIndex].content : null;

  const linkGroups = linkGroupsWithContent.map((linkGroup, groupIndex) => ({
    label: linkGroup.label,
    links: linkGroup.links.map((link, linkIndex) => ({
      label: link.label,
      active: groupIndex === activeGroupIndex && linkIndex === activeLinkIndex,
    })),
  }));

  return (
    <>
      <div role="alert">
        {menypanelFeilmelding && (
          <Nav.AlertStripe type="feil" className="varsel menypanel__feilmelding">
            {menypanelFeilmelding}
            <Nav.Xknapp
              form="kompakt"
              onClick={() => {
                setMenypanelFeilmelding("");
              }}
            />
          </Nav.AlertStripe>
        )}
      </div>
      {visOppdaterRegisteropplysninger && redigerbart && (
        <OppdaterRegisteropplysninger
          sistOppdatert={formatterDatoTilNorsk(sisteOpplysningerHentetDato)}
          oppdaterRegisteropplysninger={lagreSoknadOgOppfriskSaksopplysninger}
        />
      )}
      <div className="menypanel">
        <Nav.Column xs="3" className="utenPadding">
          <Sidemeny heading="Opplysninger" linkGroups={linkGroups} onClick={handleClick} />
        </Nav.Column>
        <Nav.Column xs="9" className="utenPadding">
          <Nav.Panel className="content">{activeContent || <div />}</Nav.Panel>
        </Nav.Column>
      </div>
    </>
  );
};

export default connector(Menypanel);
