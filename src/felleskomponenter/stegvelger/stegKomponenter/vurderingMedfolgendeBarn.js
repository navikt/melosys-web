import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';

import MKV from '../../../melosyskodeverk';

import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import {
  konverterTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
  lagAvklartefaktaBegrunnelse,
  hentFaktaVerdi,
} from '../../../regler/avklartefakta';

import './vurderingMedfolgendeBarn.css';

const MedfolgendeBarn = ({
  navn,
  idNummer,
  omfattet,
  redigerbart,
  onCheck,
  onMount,
  onUnmount,
}) => {
  const radioName = Utils._uuid();

  useEffect(() => {
    onMount();

    return () => {
      onUnmount();
    };
  }, []);

  return (
    <Nav.Row className="vurdering-medfolgende-barn__enkelt">
      <Nav.Column xs="12">
        <div className="personalia">
          <Nav.typo.Element>{navn}</Nav.typo.Element>
          &nbsp;
          <Nav.typo.Normaltekst>(F.nr: {idNummer})</Nav.typo.Normaltekst>
        </div>
        <Nav.Fieldset legend="" className="radios">
          <Nav.Radio
            name={radioName}
            onChange={e => onCheck(e.target.value)}
            value={KV.Koder.BoolskAvklartfaktaType.SANN}
            checked={omfattet === true}
            label="Ja"
            disabled={!redigerbart}
          />
          <Nav.Radio
            name={radioName}
            onChange={e => onCheck(e.target.value)}
            value={KV.Koder.BoolskAvklartfaktaType.USANN}
            checked={omfattet === false}
            label="Nei"
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
  omfattet: PT.oneOf([true, false, null]),
  redigerbart: PT.bool.isRequired,
  onCheck: PT.func.isRequired,
  onUnmount: PT.func.isRequired,
  onMount: PT.func.isRequired,
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
  useEffect(() => () => {
    slettData();
  }, []);

  return (
    <Nav.Container fluid className="vurdering-medfolgende-barn">
      <Nav.typo.Undertittel className="undertittel">Skal barn oppgitt i søknaden være omfattet av norsk lovgivning?</Nav.typo.Undertittel>
      {
        medfolgendeBarn.map(barn => {
          const medfolgendeBarnEnkeltfakta = vurderingLovvalgBarnFakta.find(af => af.subjektID === barn.uuid) || {};
          const omfattet = () => {
            const faktaVerdi = hentFaktaVerdi(medfolgendeBarnEnkeltfakta);
            if (faktaVerdi === KV.Koder.BoolskAvklartfaktaType.SANN) {
              return true;
            } else if (faktaVerdi === KV.Koder.BoolskAvklartfaktaType.USANN) {
              return false;
            }
            return null;
          };
          const onMount = () => oppdaterData(konverterTilStegData(medfolgendeBarnEnkeltfakta));
          const onUnmount = () => slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, barn.uuid));
          const onCheck = value => oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, barn.uuid, value));

          return <MedfolgendeBarn
            key={barn.uuid}
            navn={barn.navn}
            idNummer={barn.fnr}
            redigerbart={redigerbart}
            omfattet={omfattet()}
            onCheck={onCheck}
            onUnmount={onUnmount}
            onMount={onMount}
          />;
        })
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
  vurderingLovvalgBarnFakta: MPT.AvklartefaktaListe,
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  medfolgendeBarn: PT.arrayOf(PT.object).isRequired,
  tilstand: PT.object,
};

VurderingMedfolgendeBarn.defaultProps = {
  vurderingLovvalgBarnFakta: [],
  tilstand: {},
};

const mapStateToProps = state => ({
  medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
});

export default connect(mapStateToProps)(VurderingMedfolgendeBarn);
