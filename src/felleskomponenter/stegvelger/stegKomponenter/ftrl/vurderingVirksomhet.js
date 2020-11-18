import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../../../../utils/navFrontend';
import * as Mui from '../../../../felleskomponenter/ui';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';

import './vurderingVirksomhet.css';

const VurderingVirksomhet = ({
  virksomheterListe,
  redigerbart,
  bekreftOgFortsett,
  tilbake,
}) => {
  const hjelpetekst = 'Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. ' +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';
  const [valgtVirksomheter, setValgtVirksomheter] = useState([]);
  const [erValgtVirksomheterGyldig, setErValgtVirksomheterGyldig] = useState(false);

  useEffect(() => {
    setErValgtVirksomheterGyldig(valgtVirksomheter.length > 0);
  }, [valgtVirksomheter]);

  const handleFortsett = () => {
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
        onChange={checkedVirksomheter => setValgtVirksomheter(checkedVirksomheter)}
        disabled={!redigerbart}
        defaultValg={valgtVirksomheter}
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
};

const mapStateToProps = state => ({
  virksomheterListe: behandlingsgrunnlagSelectors.AlleVirksomheterSelector(state),
});

export default connect(mapStateToProps, null)(VurderingVirksomhet);
