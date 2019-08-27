import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as RegistreringContext from '../state/registreringContext';
import { endrePeriodeSelectors, endrePeriodeActions } from '../state/ducks/endrePeriode';
import { lovvalgsperioderSelectors } from '../../../../ducks/lovvalgsperioder';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import './endrePeriode.css';

const EndrePeriode = ({
  endrePeriode,
  lovvalgsperiode,
  sedLovvalgsperiode,
  oppdaterFom,
  oppdaterTom,
  oppdaterBegrunnelse,
  oppdaterFritekst,
  feilmeldinger,
  redigerbart,
}) => {
  const {
    fom, tom, begrunnelse, fritekst,
  } = endrePeriode;

  const tilPeriode = (fomDato, tomDato) => ({
    fom: Utils.dato.formatterDatoTilNorsk(fomDato),
    tom: Utils.dato.formatterDatoTilNorsk(tomDato),
  });

  const hentLovvalgsperiode = props => (
    !Utils._isEmpty(props.lovvalgsperiode)
      ? tilPeriode(props.lovvalgsperiode.fomDato, props.lovvalgsperiode.tomDato)
      : tilPeriode(props.sedLovvalgsperiode.fom, props.sedLovvalgsperiode.tom));

  React.useEffect(() => {
    const periode = hentLovvalgsperiode({ lovvalgsperiode, sedLovvalgsperiode });
    oppdaterFom(periode.fom);
    oppdaterTom(periode.tom);
  }, [lovvalgsperiode]);

  const formaterDato = (event, oppdater) => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    if (nyDato) {
      oppdater(nyDato);
    }
  };

  return (
    <div className="endre_periode">
      <React.Fragment>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Startdato"
            value={fom}
            onChange={e => oppdaterFom(e.target.value)}
            onBlur={e => formaterDato(e, oppdaterFom)}
            feil={feilmeldinger.fom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Sluttdato"
            value={tom}
            onChange={e => oppdaterTom(e.target.value)}
            onBlur={e => formaterDato(e, oppdaterTom)}
            feil={feilmeldinger.tom}
            disabled={!redigerbart} />
        </Nav.Column>
      </React.Fragment>
    </div>
  );
};

EndrePeriode.propTypes = {
  endrePeriode: PT.object.isRequired, // TODO: shape()
  lovvalgsperiode: PT.object.isRequired,
  sedLovvalgsperiode: MPT.Periode,
  oppdaterFom: PT.func.isRequired,
  oppdaterTom: PT.func.isRequired,
  oppdaterBegrunnelse: PT.func.isRequired,
  oppdaterFritekst: PT.func.isRequired,
  feilmeldinger: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

EndrePeriode.defaultProps = {
  sedLovvalgsperiode: {},
};

const mapStateToProps = state => ({
  endrePeriode: endrePeriodeSelectors.EndrePeriodeSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  sedLovvalgsperiode: behandlingerSelectors.SEDSelector(state).lovvalgsperiode,
});

const mapDispatchToProps = dispatch => ({
  oppdaterFom: fom => dispatch(endrePeriodeActions.oppdaterFom(fom)),
  oppdaterTom: tom => dispatch(endrePeriodeActions.oppdaterTom(tom)),
  oppdaterBegrunnelse: begrunnelse => dispatch(endrePeriodeActions.oppdaterBegrunnelse(begrunnelse)),
  oppdaterFritekst: fritekst => dispatch(endrePeriodeActions.oppdaterFritekst(fritekst)),
});

export default RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(EndrePeriode);
