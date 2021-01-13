import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { OppsummertFaktaVirksomheter } from "Domene";

import * as Nav from "../../../../utils/navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { oppsummertfaktaOperations } from "../../../../ducks/oppsummertfakta";

import "./vurderingVirksomhet.css";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";

const mapStateToProps = (state: RootState) => ({
  virksomheterListe: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOppsummertFakta: (behandlingID: number) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID)),
  oppdaterVirksomheterState: (virksomheter: OppsummertFaktaVirksomheter) =>
    dispatch(oppsummertfaktaOperations.oppdaterVirksomheterState(virksomheter)),
  sendVirksomheter: (behandlingID: number, virksomheter: OppsummertFaktaVirksomheter) =>
    dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  lagredeVirksomheter: string[];
  oppdater: () => void;
  redigerbart: boolean;
  tilbake: () => void;
}

const VurderingVirksomhet = ({
  behandlingID,
  bekreft,
  hentBehandlingsgrunnlag,
  hentOppsummertFakta,
  lagredeVirksomheter,
  oppdater,
  oppdaterVirksomheterState,
  redigerbart,
  sendVirksomheter,
  tilbake,
  virksomheterListe,
}: Props & PropsFromRedux) => {
  const [valgteVirksomheter, setValgteVirksomheter] = useState(lagredeVirksomheter);
  const [erValgtVirksomheterGyldig, setErValgtVirksomheterGyldig] = useState(false);
  const [erBehandlingsgrunnlagLastetInn, setErBehandlingsgrunnlagLastetInn] = useState(false);
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

  const lastInnBehandlingsgrunnlag = async () => {
    await hentBehandlingsgrunnlag(behandlingID);
    setErBehandlingsgrunnlagLastetInn(true);
  };

  useEffect(() => {
    lastInnBehandlingsgrunnlag();
    return () => {
      hentOppsummertFakta(behandlingID);
    };
  }, []);

  const oppdaterVirksomheterOgStegvelger = async () => {
    await oppdaterVirksomheterState({ virksomhetIDer: valgteVirksomheter });
    oppdater();
  };

  useEffect(() => {
    setErValgtVirksomheterGyldig(valgteVirksomheter.length > 0);
    oppdaterVirksomheterOgStegvelger();
  }, [valgteVirksomheter]);

  const handleFortsett = () => {
    sendVirksomheter(behandlingID, { virksomhetIDer: valgteVirksomheter });
    bekreft();
  };

  if (!erBehandlingsgrunnlagLastetInn) {
    return null;
  }

  return (
    <div className="vurderingVirksomhet">
      <Nav.typo.Undertittel className="undertittel">
        Velg virksomhet
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      </Nav.typo.Undertittel>

      <Mui.Checkboxgruppe
        muligeValg={virksomheterListe.map((virksomhet) => ({ kode: virksomhet.virksomhetId, term: virksomhet.navn }))}
        onChange={(checkedVirksomheter) => setValgteVirksomheter(checkedVirksomheter)}
        disabled={!redigerbart}
        defaultValg={valgteVirksomheter}
      />

      <div className="fane__knapplinje">
        <Nav.Knapp mini className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!erValgtVirksomheterGyldig}
          className="fane__navigasjonsknapp"
          onClick={handleFortsett}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

export default connector(VurderingVirksomhet);
