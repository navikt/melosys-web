import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as Api from '../../../../../services/api';
import * as Utils from '../../../../../utils';

import { soknadSelectors } from '../../../../../ducks/soknad';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../../../ducks/lovvalgsperioder';

import { datoDiffMenneskelig } from '../../../../../utils/dato';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

import './vurderingVedtak.css';

const uuid = require('uuid/v4');

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

const VurderingVedtak = ({
  lovvalgsperioder,
  soknadsland,
  redigerbart,
  behandlingID,
  lagreOgFatteVedtak,
}) => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)
  const [mottakerinstitusjoner, setMottakerinstitusjoner] = useState([]);
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState(null);

  const hentMottakerinstitusjoner = async () => {
    try {
      const institusjoner = await Api.Eessi.mottakerinstitusjoner.hent(EKV.Koder.buctyper.legislation.LA_BUC_04, soknadsland[0]);
      setMottakerinstitusjoner(institusjoner);

      if (institusjoner.length > 0) {
        setValgtMottakerinstitusjon(institusjoner[0].id);
      }
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  useEffect(() => {
    hentMottakerinstitusjoner();
  }, []);

  const valgtMottakerinstitusjonHandler = e => setValgtMottakerinstitusjon(e.target.value);

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgsbestemmelse,
  } = lovvalget;

  const antallManeder = datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, alleLovvalg);
  const skalSendeSed = mottakerinstitusjoner.length > 0;

  const pdfDokumenter = [
    { navn: 'Forhåndsvis vedtaksbrev og A1', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
  ];

  const visSedLenkeForLovvalgsbestemmelser = [
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
  ];

  if (lovvalgSomKodeTerm && visSedLenkeForLovvalgsbestemmelser.includes(lovvalgSomKodeTerm.kode)) {
    pdfDokumenter.push({ navn: 'Orienteringsbrev til arbeidsgiver', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER, data: { mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER } });
  }

  if (skalSendeSed) {
    pdfDokumenter.push({ navn: 'Forhåndsvis SED A009', type: EKV.Koder.sedtyper.A009, erSed: true });
  }

  const fattVedtak = () => lagreOgFatteVedtak(MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND, valgtMottakerinstitusjon);

  return (
    <div className="vedtak">
      <Nav.Undertittel>Omfattet av norsk trygdelovgivning etter { KV.objektTilTerm(lovvalgSomKodeTerm) }</Nav.Undertittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: lovvalget.fomDato, tom: lovvalget.tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6">
            <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
            <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        {
          skalSendeSed &&
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Nav.Select label="Velg utenlandsk institusjon som skal motta SED" onChange={valgtMottakerinstitusjonHandler}>
                <option key={uuid()} value="" disabled>Velg...</option>
                {mottakerinstitusjoner.map(institusjon => <option key={institusjon.id} value={institusjon.id}>{institusjon.navn}</option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        }
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Hovedknapp disabled={!redigerbart} onClick={fattVedtak}>Fatt vedtak</Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  lagreOgFatteVedtak: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  soknadsland: PT.arrayOf(PT.string).isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  soknadsland: soknadSelectors.SoknadslandSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
