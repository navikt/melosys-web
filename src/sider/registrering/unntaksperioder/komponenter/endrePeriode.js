import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import './endrePeriode.css';

const EndrePeriode = ({
  endrePeriode,
  lovvalgsperiode,
  sedLovvalgsperiode,
  toggleSkalEndres,
  oppdaterFom,
  oppdaterTom,
  oppdaterBegrunnelse,
  oppdaterFritekst,
  feilmeldinger,
  redigerbart,
}) => {
  const {
    skalEndres, fom, tom, begrunnelse, fritekst,
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

  const datoSjekkGyldig = () => {
    const varighet = Utils.dato.datoDiff(fom, tom, 'years');

    if (varighet <= 0) {
      return 'Ugyldig periode';
    } else if (varighet > 5) {
      return 'Perioden overstiger 5 år';
    }
    return null;
  };
  const datoVarselStripe = () => {
    const gyldig = datoSjekkGyldig();
    if (gyldig) {
      return (
        <Nav.Column xs="8">
          <Nav.AlertStripe className="feilmelding" type="advarsel" >
            {gyldig}
          </Nav.AlertStripe>
        </Nav.Column>
      );
    }
    return null;
  };
  return (
    <div className="endre_periode">
      <Nav.Column xs="12">
        <Nav.Element>Lovvalgsperiode fra SED</Nav.Element>
        <Nav.Checkbox
          label="Jeg vil endre perioden"
          checked={skalEndres}
          onChange={toggleSkalEndres}
          disabled={!redigerbart} />
      </Nav.Column>
      {skalEndres &&
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
        {datoVarselStripe()}
        <Nav.Column xs="12">
          <Nav.Select
            bredde="xl"
            label="Begrunnelse for endret periode"
            value={begrunnelse}
            onChange={e => oppdaterBegrunnelse(e.target.value)}
            disabled={!redigerbart}
          >
            {MKV.KTObjects.begrunnelser.folketrygdloven.endret_unntaksperiode.map(kodeobjekt =>
              <option key={kodeobjekt.kode} value={kodeobjekt.kode}>{kodeobjekt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
        {fritekstPaakrevd() &&
        <Nav.Column xs="6">
          <Nav.Textarea
            label="Skriv inn begrunnelse for endring av periode..."
            maxLength={255}
            onChange={e => oppdaterFritekst(e.target.value)}
            value={fritekst}
            feil={feilmeldinger.fritekst}
            disabled={!redigerbart} />
        </Nav.Column>
        }
      </React.Fragment>
      }
    </div>
  );
};

EndrePeriode.propTypes = {
  endrePeriode: PT.object.isRequired, // TODO: shape()
  lovvalgsperiode: PT.object.isRequired,
  sedLovvalgsperiode: MPT.Periode,
  toggleSkalEndres: PT.func.isRequired,
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
