import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import ListevelgerFlervalg from '../../../../felleskomponenter/ui/listevelgerFlervalg';

import { BOOLSK } from '../../../../constants';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../../regler/vilkar';

const EnkeltVilkaar = props => {
  const {
    redigerbart, begrunnelser,
    tittel, labelOppfylt, labelIkkeOppfylt,
    vilkaar, vilkaarKode,
    oppdaterData,
  } = props;

  useEffect(() => {
    oppdaterData(konverterTilStegData(vilkaarKode, vilkaar));
  }, []);

  const radioEndringHandler = event => {
    oppdaterData(lagVilkaar(vilkaarKode, event.target.value));
  };

  const listevalgEndringHandler = event => {
    oppdaterData(lagBegrunnelse(vilkaarKode, event.value));
  };

  return (
    <div className="enkeltVilkaar__skjemafelt">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend={tittel}>
            <Nav.Radio
              name={vilkaarKode}
              label={labelOppfylt}
              value={BOOLSK.SANN}
              checked={vilkaar.oppfylt === BOOLSK.SANN}
              onChange={radioEndringHandler}
              disabled={!redigerbart}
            />
            <Nav.Radio
              name={vilkaarKode}
              label={labelIkkeOppfylt}
              value={BOOLSK.USANN}
              checked={vilkaar.oppfylt === BOOLSK.USANN}
              onChange={radioEndringHandler}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      {!vilkaar.oppfylt && (
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <ListevelgerFlervalg
                muligeValg={begrunnelser}
                label="Legg til begrunnelse:"
                tillatFritekst={false}
                onChange={listevalgEndringHandler}
                defaultElementer={vilkaar.begrunnelseKoder}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>)
      }
    </div>
  );
};

EnkeltVilkaar.propTypes = {
  redigerbart: PT.bool.isRequired,
  vilkaar: PT.object.isRequired,
  vilkaarKode: PT.string.isRequired,
  tittel: PT.string.isRequired,
  labelOppfylt: PT.string.isRequired,
  labelIkkeOppfylt: PT.string.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
};

EnkeltVilkaar.defaultProps = {
  begrunnelser: [],
};

export default EnkeltVilkaar;
