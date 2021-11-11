import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../navFrontend";
import * as Etiketter from "./etiketter";

import MKV from "../../melosyskodeverk";

import Sidemeny from "../sidemeny";
import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";

import { LinkGroupsFactory } from "./linkgroups";

import { behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";

import "./menypanel.css";
import { menypanelSelectors } from "../../ducks/menypanel";
import { formatterDatoTilNorsk } from "../../utils/dato";

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.behandlingsgrunnlagtyper;

const { ARBEID_I_UTLANDET, TRYGDEAVTALE_UK } = MKV.Koder.behandlinger.behandlingstema;

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
  sisteOpplysningerHentetDato: behandlingsgrunnlagSelectors.SisteOpplysningerHentetDatoSelector(state),
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
    visEktefelleSamboerMedPaReisen: behandlingstema === ARBEID_I_UTLANDET || behandlingstema === TRYGDEAVTALE_UK,
    behandlingsgrunnlagEtikett:
      behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SED ? <Etiketter.FraSed /> : <Etiketter.FraSoknad />,
    visRepresentantIUtlandet: behandlingstema === MKV.Koder.behandlinger.behandlingstema.TRYGDEAVTALE_UK,
    redigerbart,
    lagreSoknadOgOppfriskSaksopplysninger,
    setMenypanelFeilmelding,
  };

  const linkGroupsWithContent = LinkGroupsFactory.createLinkGroups({
    behandlingstema,
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
