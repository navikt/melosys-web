import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import { endrePeriodeSkjema } from './validering/endrePeriodeSkjema';
import { createValidator } from '../soknad-komponenter/skjema/validering/skjemaer/createValidator';
import './endrePeriode.css';

export const EndrePeriode = forwardRef(({
  periode, lovvalgsland, lovvalgsbestemmelse, redigerbart,
}, ref) => {
  const [skalEndres, setSkalEndres] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState(MKV.KTObjects.begrunnelser.endretunntaksperiode[0].kode);
  const [fritekst, setFritekst] = useState('');
  const [fom, setFom] = useState(periode.fom);
  const [tom, setTom] = useState(periode.tom);
  const [feilmeldinger, setFeilmeldinger] = useState({ fom: undefined, tom: undefined, fritekst: undefined });

  useEffect(() => {
    setFom(periode.fom);
    setTom(periode.tom);
  }, [periode]);

  const setters = {
    skalEndres: setSkalEndres,
    begrunnelse: setBegrunnelse,
    fritekst: setFritekst,
    fom: setFom,
    tom: setTom,
  };

  const settValgtBegrunnelse = event => setBegrunnelse(event.nativeEvent.target[event.nativeEvent.target.selectedIndex].value);

  const endreTekstFelt = (event, felt) => setters[felt](event.target.value);

  const fritekstPaakrevd = () => begrunnelse === MKV.Koder.begrunnelser.endretunntaksperiode.ANNET;

  const formaterDato = (event, felt) => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    if (nyDato) {
      setters[felt](nyDato);
    }
  };

  const lagAvklartefakta = () => ([{
    subjektID: null,
    avklartefaktaKode: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    referanse: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    fakta: [begrunnelse],
    begrunnelseKoder: [],
    begrunnelseFritekst: fritekst || null,
  }]);

  const lagLovvalgsperioder = () => ([{
    fomDato: `${Utils.dato.formatterDatoTilISO(fom)}`,
    tomDato: `${Utils.dato.formatterDatoTilISO(tom)}`,
    lovvalgsbestemmelse,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland,
    unntakFraLovvalgsland: null,
    trygdeDekning: MKV.Koder.trygdedekninger.UTEN_DEKNING,
    medlemskapstype: MKV.Koder.medlemskapstyper.UNNTATT,
    medlemskapsperiodeID: null,
  }]);

  useImperativeHandle(ref, () => ({
    validerEndringPeriode: () => {
      if (!redigerbart) {
        return true;
      }

      const settings = { context: { paakrevd: fritekstPaakrevd() } };
      const valideringResultat = createValidator(endrePeriodeSkjema)({ fom, tom, fritekst }, settings);
      const validert = Utils._isEmpty(valideringResultat);

      if (!validert) {
        setFeilmeldinger(valideringResultat);
      }
      return validert;
    },
    dispatchEndrePeriode: behandlingID => {
      if (skalEndres && redigerbart) {
        return Api.Avklartefakta.send(behandlingID, lagAvklartefakta())
          .then(() => Api.Lovvalgsperioder.send(behandlingID, lagLovvalgsperioder()));
      }

      return Promise.resolve();
    },
  }));

  return (
    <div className="endre_periode">
      <Nav.Column xs="12">
        <Nav.Element>Lovvalgsperiode fra SED</Nav.Element>
        <Nav.Checkbox
          label="Jeg vil endre perioden"
          checked={skalEndres}
          onChange={() => setSkalEndres(!skalEndres)}
          disabled={!redigerbart} />
      </Nav.Column>
      {skalEndres &&
      <React.Fragment>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Startdato"
            value={fom}
            onChange={e => endreTekstFelt(e, 'fom')}
            onBlur={e => formaterDato(e, 'fom')}
            feil={feilmeldinger.fom}
            disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Input
            bredde="fullbredde"
            label="Sluttdato"
            value={tom}
            onChange={e => endreTekstFelt(e, 'tom')}
            onBlur={e => formaterDato(e, 'tom')}
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
            {MKV.KTObjects.begrunnelser.endretunntaksperiode.map(kodeobjekt =>
              <option key={kodeobjekt.kode} value={kodeobjekt.kode}>{kodeobjekt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
        {fritekstPaakrevd() &&
        <Nav.Column xs="6">
          <Nav.Textarea
            label="Skriv inn begrunnelse for endring av periode..."
            maxLength={255}
            onChange={e => endreTekstFelt(e, 'fritekst')}
            value={fritekst}
            feil={feilmeldinger.fritekst}
            disabled={!redigerbart} />
        </Nav.Column>
        }
      </React.Fragment>
      }
    </div>
  );
});

EndrePeriode.propTypes = {
  periode: PT.shape({
    fom: PT.string.isRequired,
    tom: PT.string.isRequired,
  }).isRequired,
  lovvalgsland: PT.string.isRequired,
  lovvalgsbestemmelse: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
};
