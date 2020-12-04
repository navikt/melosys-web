import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';

import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import { konverterTilStegData, lagAvklartfakta, lagAvklartefaktaBegrunnelse } from '../../../regler/avklartefakta';

const MedfolgendeBarn = ({
  navn,
  idNummer,
  omfattet,
  redigerbart,
  onCheck,
}) => {
  const radioName = Utils._uuid();

  return (
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.typo.Element>{navn}</Nav.typo.Element>
        <Nav.typo.Normaltekst>(F.nr: {idNummer})</Nav.typo.Normaltekst>
        <Nav.Fieldset legend="">
          <Nav.Radio
            name={radioName}
            onChange={e => onCheck(e.target.value)}
            value
            checked={omfattet === true}
            label="Ja"
            disabled={!redigerbart}
          />
          <Nav.Radio
            name={radioName}
            onChange={e => onCheck(e.target.value)}
            value={false}
            checked={omfattet === true}
            label="Ja"
            disabled={!redigerbart}
          />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

MedfolgendeBarn.propTypes = {
  navn: PT.string,
  idNummer: PT.string,
  omfattet: PT.bool,
  redigerbart: PT.bool.isRequired,
  onCheck: PT.func.isRequired,
};

MedfolgendeBarn.defaultProps = {
  navn: '',
  idNummer: '',
  omfattet: null,
};

const VurderingMedfolgendeBarn = ({
  vurderingLovvalgBarnFakta,
  medfolgendeBarn,
  bekreftOgFortsett,
  redigerbart,
  oppdaterData,
  slettData,
  tilstand: {
    harAvklaring,
  },
}) => {
  useEffect(() => {
    oppdaterData(konverterTilStegData(vurderingLovvalgBarnFakta));

    return () => {
      slettData();
    };
  }, []);

  return (
    <Nav.Container fluid>
      {
        medfolgendeBarn.map(barn => (
          <MedfolgendeBarn
            key={Utils._uuid()}
            navn={barn.navn}
            idNummer={barn.fnr}
            redigerbart={redigerbart}
            omfattet={}
            onCheck={}
          />
        ))
      }
      <div className="vurdering-medfolgende-barn">
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </Nav.Container>
  );
};

VurderingMedfolgendeBarn.propTypes = {
  vurderingLovvalgBarnFakta: MPT.Avklartefakta,
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  medfolgendeBarn: PT.arrayOf(PT.object).isRequired,
  tilstand: PT.object,
};

VurderingMedfolgendeBarn.defaultProps = {
  vurderingLovvalgBarnFakta: {},
  tilstand: {},
};

const mapStateToProps = state => ({
  medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
});

export default connect(mapStateToProps)(VurderingMedfolgendeBarn);
