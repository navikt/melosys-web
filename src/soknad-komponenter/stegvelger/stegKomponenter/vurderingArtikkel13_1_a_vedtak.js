import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';
import * as Validering from '../../skjema/validering';

import PdfLenkeListe from '../../../soknad-komponenter/pdfLenkeListe';
import { KodeTermSelect } from '../../kodeTermSelect';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

import {
  hentFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  slettAvklartfakta,
} from '../../../regler/avklartefakta';

import './vurderingArtikkel13_1_a_vedtak.css';
import { skjemaelementFeilmeldingShape } from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';

const VurderingArtikkel13_1_a_vedtak = props => {
  const {
    redigerbart, behandlingID, lovvalgsperiode, oppdaterData, slettData, tilstand: { aarsakEndringPeriodeFakta }, endreDatoOgSendLovvalgsperioder, lagreOgFatteVedtak,
  } = props;
  const [forkortLovvalgsperiode, setForkortLovvalgsperiode] = useState(false);
  const [tomDatoInput, setTomDatoInput] = useState('');
  const [feil, setFeil] = useState({});

  useEffect(() => {
    oppdaterData(konverterTilStegData(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE, aarsakEndringPeriodeFakta));

    // TODO: Komme tilbake til dette når det er bestemt hvordan begrunnelse skal håndteres. Det må lagres noe info som kan sette state for checkboxen.
    if (!Utils._isEmpty(aarsakEndringPeriodeFakta)) setForkortLovvalgsperiode(true);

    if (!redigerbart) setTomDatoInput(lovvalgsperiode.tom);

    return function cleanup() {
      slettData(slettAvklartfakta(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE));
    };
  }, []);

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis A1',
      type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
  ];

  const handleCheckboxChange = () => {
    setForkortLovvalgsperiode(!forkortLovvalgsperiode);
    slettData(slettAvklartfakta(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE));
  };

  const handleBegrunnelseChange = e => {
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE, null, e.target.value));
  };

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  const aarsakEndringPeriodeBegrunnelse = hentFaktaVerdi(aarsakEndringPeriodeFakta);

  const vedTomDatoEndring = e => {
    setTomDatoInput(e.target.value);
  };

  const vedTomDatoBlur = e => {
    const nyTomDato = Utils.dato.vaskInputDato(e.target.value) || e.target.value;
    setTomDatoInput(nyTomDato);
  };

  const valider = Validering.Skjemaer.createValidator(Validering.Skjemaer.artikkel13_1_a);

  const erValid = () => {
    const validateResult = valider({ fomDato: lovvalgsperiode.fom, tomDato: tomDatoInput, forkortLovvalgsperiode });
    setFeil(validateResult);

    return Utils._isEmpty(validateResult);
  };

  const vedKlikk = async () => {
    if (!erValid()) return;

    if (forkortLovvalgsperiode) {
      await endreDatoOgSendLovvalgsperioder(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(tomDatoInput));
    }

    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.IKKE_FASTSATT, true); // TODO: Sjekke hvilken resultattype som skal brukes her
  };

  const feilmeldinger = Object.keys(feil).reduce((feilSamling, enkeltFeil) => (
    { ...feilSamling, [enkeltFeil]: { feilmelding: feil[enkeltFeil] } }
  ), []);

  return (
    <Fragment>
      <Nav.Undertittel>Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a</Nav.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Nav.Element className="undertittel">Lovvalgsperiode</Nav.Element>
          <Nav.Row className="lovvalgsperiodeRow">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      <Nav.Row className="checkboxRow">
        <Nav.Column xs="6">
          <Nav.Checkbox checked={forkortLovvalgsperiode} disabled={!redigerbart} onChange={handleCheckboxChange} label="Lovvalgsperioden er avkortet." />
        </Nav.Column>
      </Nav.Row>
      {
        forkortLovvalgsperiode &&
        <Fragment>
          <Nav.Row>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="fullbredde"
                label="Startdato"
                value={fom}
                disabled
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="fullbredde"
                label="Sluttdato"
                onChange={vedTomDatoEndring}
                onBlur={vedTomDatoBlur}
                value={tomDatoInput}
                feil={feilmeldinger.tomDato}
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
          {/* <Nav.Row>
            <Nav.Column xs="6">
              <KodeTermSelect
                // feil={begrunnelseFeilmelding}
                koder={MKV.KTObjects.begrunnelser.endretperiode}
                label="Begrunnelse for endret periode"
                value={aarsakEndringPeriodeBegrunnelse}
                onChange={handleBegrunnelseChange}
                redigerbart={redigerbart}
              />
            </Nav.Column>
          </Nav.Row> */}
        </Fragment>
      }
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikk} disabled={!redigerbart} type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13_1_a_vedtak.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: PT.object,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    aarsakEndringPeriodeFakta: MPT.Avklartefakta,
  }).isRequired,
  endreDatoOgSendLovvalgsperioder: PT.func.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
};

VurderingArtikkel13_1_a_vedtak.defaultProps = {
  lovvalgsperiode: {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel13_1_a_vedtak);
