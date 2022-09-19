import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import { formatterDatoTilNorsk } from "../../utils/dato";

import Sidemeny from "../sidemeny";

import { behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelSelectors } from "../../ducks/menypanel";
import { fagsakSelectors } from "../../ducks/fagsaker";

import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";
import { LinkGroupsFactory } from "./linkgroups";
import "./menypanel.css";

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.behandlingsgrunnlagtyper;

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  sisteOpplysningerHentetDato: behandlingerSelectors.SisteOpplysningerHentetDatoSelector(state),
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
  visMenypanel: menypanelSelectors.ErMenypanelSynlig(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type MenypanelProps = PropsFromRedux & {
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  visOppdaterRegisteropplysninger?: boolean;
};

export const Menypanel = ({
  sisteOpplysningerHentetDato,
  behandlingsgrunnlagtype,
  sakstype,
  behandlingstema,
  behandlingstype,
  visMenypanel,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  visOppdaterRegisteropplysninger = true,
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);
  const [menypanelFeilmelding, setMenypanelFeilmelding] = useState("");

  if (!visMenypanel) return null;

  const contentProps = {
    visArbeidsforholdRolleEtiketter: behandlingsgrunnlagtype === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
    visBehandlingsgrunnlagData: !(
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
    behandlingsgrunnlagtype,
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
        <Sidemeny heading="Opplysninger" linkGroups={linkGroups} onClick={handleClick} />
        <Nav.Panel className="content">{activeContent || <div />}</Nav.Panel>
      </div>
    </>
  );
};

export default connector(Menypanel);
