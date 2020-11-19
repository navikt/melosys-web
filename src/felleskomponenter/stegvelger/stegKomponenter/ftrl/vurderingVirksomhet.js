import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../../../../utils/navFrontend';
import * as Mui from '../../../../felleskomponenter/ui';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';

import './vurderingVirksomhet.css';
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from '../../../../ducks/oppsummertfakta';
import {behandlingerSelectors} from "../../../../ducks/behandlinger";

const VurderingVirksomhet = ({
  virksomheterListe,
  redigerbart,
  bekreftOgFortsett,
  tilbake,
  lagredeVirksomheter,
  sendVirksomheter,
  behandlingID
}) => {
  const hjelpetekst = 'Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. ' +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';
  const [valgteVirksomheter, setValgteVirksomheter] = useState(lagredeVirksomheter);
  const [erValgtVirksomheterGyldig, setErValgtVirksomheterGyldig] = useState(false);

  useEffect(() => {
    setErValgtVirksomheterGyldig(valgteVirksomheter.length > 0);
  }, [valgteVirksomheter]);

  const handleFortsett = () => {
    sendVirksomheter(behandlingID, { virksomheter: valgteVirksomheter });
    bekreftOgFortsett();
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
        muligeValg={virksomheterListe}
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

VurderingVirksomhet.propTypes = {
  virksomheterListe: PT.array.isRequired,
  redigerbart: PT.bool.isRequired,
  tilbake: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  lagredeVirksomheter: PT.array.isRequired,
};

const mapStateToProps = state => ({
  virksomheterListe: behandlingsgrunnlagSelectors.AlleVirksomheterSelector(state),
  lagredeVirksomheter: oppsummertfaktaSelectors.VirksomheterSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sendVirksomheter: (behandlingID, virksomheter) => dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingVirksomhet);
