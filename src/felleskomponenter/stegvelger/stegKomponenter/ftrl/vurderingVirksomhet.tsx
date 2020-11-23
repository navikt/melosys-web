import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { Virksomheter } from 'Domene';

import * as Nav from '../../../../utils/navFrontend';
import * as Mui from '../../../../felleskomponenter/ui';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { oppsummertfaktaOperations } from '../../../../ducks/oppsummertfakta';

import './vurderingVirksomhet.css';
import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';


const mapStateToProps = (state: RootState) => ({
  virksomheterListe: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterVirksomheterState: (virksomheter: Virksomheter) => dispatch(oppsummertfaktaOperations.oppdaterVirksomheterState(virksomheter)),
  resetOppsummertFakta: () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta()),
  sendVirksomheter: (behandlingID: number, virksomheter: Virksomheter) => dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  lagredeVirksomheter: string[],
  oppdater: () => void,
  redigerbart: boolean,
  tilbake: () => void,
}

const VurderingVirksomhet =
  ({
    behandlingID,
    bekreft,
    lagredeVirksomheter,
    oppdater,
    oppdaterVirksomheterState,
    redigerbart,
    resetOppsummertFakta,
    sendVirksomheter,
    tilbake,
    virksomheterListe,
  } : Props & PropsFromRedux) => {
    const [valgteVirksomheter, setValgteVirksomheter] = useState(lagredeVirksomheter);
    const [erValgtVirksomheterGyldig, setErValgtVirksomheterGyldig] = useState(false);
    const hjelpetekst = 'Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. ' +
      'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

    useEffect(() => () => {
      resetOppsummertFakta();
    }, []);

    const oppdaterVirksomheterOgStegvelger = async () => {
      await oppdaterVirksomheterState({ orgnummer: valgteVirksomheter });
      oppdater();
    };

    useEffect(() => {
      setErValgtVirksomheterGyldig(valgteVirksomheter.length > 0);
      oppdaterVirksomheterOgStegvelger();
    }, [valgteVirksomheter]);

    const handleFortsett = () => {
      sendVirksomheter(behandlingID, { orgnummer: valgteVirksomheter });
      bekreft();
    };

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">
          Velg virksomhet
          <Nav.Hjelpetekst
            className="hjelpetekst"
            tittel={hjelpetekst}
            type={Nav.PopoverOrientering.Hoyre}
          >
            {hjelpetekst}
          </Nav.Hjelpetekst>
        </Nav.typo.Undertittel>

        <Mui.Checkboxgruppe
          muligeValg={virksomheterListe.map(virksomhet => ({ kode: virksomhet.virksomhetId, term: virksomhet.navn }))}
          onChange={checkedVirksomheter => setValgteVirksomheter(checkedVirksomheter)}
          disabled={!redigerbart}
          defaultValg={valgteVirksomheter}
        />

        <div className="fane__knapplinje">
          <Nav.Knapp
            mini
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!erValgtVirksomheterGyldig}
            className="fane__navigasjonsknapp"
            onClick={handleFortsett}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };

export default connector(VurderingVirksomhet);
