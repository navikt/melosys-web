import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import ListevelgerFlervalg from '../../../../komponenter/ui/listevelgerFlervalg';

import {
  avklartefaktaType,
  hentFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
} from '../../../../regler/avklartefakta';

const uuid = require('uuid/v4');

const EnkeltAvklartfakta = props => {
  const {
    redigerbart, begrunnelser, tittel,
    avklartefaktaTyper,
    avklartfakta, avklartfaktaKode,
    oppdaterData, onChange,
  } = props;

  const fakta = hentFaktaVerdi(avklartfakta);

  useEffect(() => {
    oppdaterData(konverterTilStegData(avklartfaktaKode, avklartfakta));

    return function cleanup() {
      if (props.slettData) {
        props.slettData(avklartefaktaType, avklartfaktaKode);
      }
    };
  }, []);

  const radioEndringHandler = event => {
    oppdaterData(lagAvklartfakta(avklartfaktaKode, null, event.target.value));

    if (onChange) {
      onChange(event.target.value);
    }
  };

  const listevalgEndringHandler = event => {
    oppdaterData(lagAvklartefaktaBegrunnelse(avklartfaktaKode, null, event.value));
  };

  return (
    <div className="enkeltAvklartfakta__skjemafelt">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend={tittel}>
            {
              avklartefaktaTyper.map(af =>
                <Nav.Radio
                  key={uuid()}
                  name={avklartfaktaKode}
                  label={af.label}
                  value={af.type}
                  checked={fakta === af.type}
                  onChange={radioEndringHandler}
                  disabled={!redigerbart}
                />)
            }
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      {begrunnelser.length > 0 && (
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <ListevelgerFlervalg
                muligeValg={begrunnelser}
                label="Legg til begrunnelse:"
                tillatFritekst={false}
                onChange={listevalgEndringHandler}
                defaultElementer={avklartfakta.begrunnelseKoder}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>)
      }
    </div>
  );
};

EnkeltAvklartfakta.propTypes = {
  redigerbart: PT.bool.isRequired,
  avklartfakta: PT.object.isRequired,
  avklartfaktaKode: PT.string.isRequired,
  avklartefaktaTyper: PT.array.isRequired,
  tittel: PT.string.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  onChange: PT.func,
  slettData: PT.func,
};

EnkeltAvklartfakta.defaultProps = {
  begrunnelser: [],
  onChange: null,
  slettData: null,

};

export default EnkeltAvklartfakta;
