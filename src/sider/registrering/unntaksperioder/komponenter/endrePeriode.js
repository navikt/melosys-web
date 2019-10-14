import React from 'react';
import PT from 'prop-types';

import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import './endrePeriode.css';

const uuid = require('uuid/v4');

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

  const fritekstPaakrevd = () => begrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;

  const formaterDato = (event, oppdater) => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    if (nyDato) {
      oppdater(nyDato);
    }
  };

  const oppdaterFelt = (event, oppdater) => {
    event.stopPropagation();
    oppdater(event.target.value);
  };

  return (
    <div className="endre_periode">
      <React.Fragment>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Startdato"
            value={fom}
            onChange={e => oppdaterFelt(e, oppdaterFom)}
            onBlur={e => formaterDato(e, oppdaterFom)}
            feil={feilmeldinger.fom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Sluttdato"
            value={tom}
            onChange={e => oppdaterFelt(e, oppdaterTom)}
            onBlur={e => formaterDato(e, oppdaterTom)}
            feil={feilmeldinger.tom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="12">
          <Nav.Select
            bredde="xl"
            label="Begrunnelse for endret periode"
            onChange={e => oppdaterFelt(e, oppdaterBegrunnelse)}
            disabled={!redigerbart}
            feil={feilmeldinger.begrunnelse}
            defaultValue="0"
          >
            <option key={uuid()} value="0" disabled>Velg i listen</option>
            {MKV.KTObjects.begrunnelser.folketrygdloven.endret_unntaksperiode.map(kodeobjekt =>
              <option key={kodeobjekt.kode} value={kodeobjekt.kode}>{kodeobjekt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
        {fritekstPaakrevd() &&
        <Nav.Column xs="6">
          <Nav.Textarea
            label="Skriv inn begrunnelse for endring av periode..."
            maxLength={255}
            onChange={e => oppdaterFelt(e, oppdaterFritekst)}
            value={fritekst}
            feil={feilmeldinger.fritekst}
            disabled={!redigerbart} />
        </Nav.Column>
        }
      </React.Fragment>
    </div>
  );
};

EndrePeriode.propTypes = {
  endrePeriode: PT.shape({
    fom: PT.string,
    tom: PT.string,
    begrunnelse: PT.string,
    fritekst: PT.string,
  }).isRequired,
  lovvalgsperiode: PT.shape({
    fomDato: PT.string,
    tomDato: PT.string,
  }).isRequired,
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

export default EndrePeriode;
