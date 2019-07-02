import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';
import './endrePeriode.css';

export const EndrePeriode = ({
  skalEndres,
  skalEndresChangeHandler,
  fom,
  fomChangeHandler,
  tom,
  tomChangeHandler,
  begrunnelse,
  begrunnelseChangeHandler,
  fritekst,
  fritekstChangeHandler,
  feilmeldinger,
  redigerbart,
}) => {
  const settValgtBegrunnelse = event => begrunnelseChangeHandler(event.nativeEvent.target[event.nativeEvent.target.selectedIndex].value);

  const fritekstPaakrevd = () => begrunnelse === MKV.Koder.begrunnelser.ftrl_endret_unntaksperiode.ANNET;

  const formaterDato = (event, changeHandler) => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    if (nyDato) {
      changeHandler(nyDato);
    }
  };

  return (
    <div className="endre_periode">
      <Nav.Column xs="12">
        <Nav.Element>Lovvalgsperiode fra SED</Nav.Element>
        <Nav.Checkbox
          label="Jeg vil endre perioden"
          checked={skalEndres}
          onChange={() => skalEndresChangeHandler(!skalEndres)}
          disabled={!redigerbart} />
      </Nav.Column>
      {skalEndres &&
      <React.Fragment>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Startdato"
            value={fom}
            onChange={e => fomChangeHandler(e.target.value)}
            onBlur={e => formaterDato(e, fomChangeHandler)}
            feil={feilmeldinger.fom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Sluttdato"
            value={tom}
            onChange={e => tomChangeHandler(e.target.value)}
            onBlur={e => formaterDato(e, tomChangeHandler)}
            feil={feilmeldinger.tom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="12">
          <Nav.Select
            bredde="xl"
            label="Begrunnelse for endret periode"
            value={begrunnelse}
            onChange={settValgtBegrunnelse}
            disabled={!redigerbart}
          >
            {MKV.KTObjects.begrunnelser.ftrl_endret_unntaksperiode.map(kodeobjekt =>
              <option key={kodeobjekt.kode} value={kodeobjekt.kode}>{kodeobjekt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
        {fritekstPaakrevd() &&
        <Nav.Column xs="6">
          <Nav.Textarea
            label="Skriv inn begrunnelse for endring av periode..."
            maxLength={255}
            onChange={e => fritekstChangeHandler(e.target.value)}
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
  skalEndres: PT.bool.isRequired,
  skalEndresChangeHandler: PT.func.isRequired,
  fom: PT.string.isRequired,
  tom: PT.string.isRequired,
  fomChangeHandler: PT.func.isRequired,
  tomChangeHandler: PT.func.isRequired,
  begrunnelse: PT.string.isRequired,
  begrunnelseChangeHandler: PT.func.isRequired,
  fritekst: PT.string,
  fritekstChangeHandler: PT.func.isRequired,
  feilmeldinger: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

EndrePeriode.defaultProps = {
  fritekst: '',
};
