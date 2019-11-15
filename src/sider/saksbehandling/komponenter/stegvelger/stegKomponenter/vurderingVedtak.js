import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';
import * as Api from '../../../../../services/api';
import * as Utils from '../../../../../utils';

import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../../../ducks/lovvalgsperioder';
import { behandlingsresultatSelectors } from '../../../../../ducks/behandlingsresultat';

import { datoDiffMenneskelig } from '../../../../../utils/dato';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';
import Vedtaktype from '../../vedtaktype';
import Vedtaktypebegrunnelse from '../../vedtaktypebegrunnelse';

import useEventTargetValueState from '../../../../../hooks/useEventTargetValueState';

import './vurderingVedtak.css';

const uuid = require('uuid/v4');

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

const VurderingVedtak = ({
  lovvalgsperioder,
  gyldigeSoknadsland,
  redigerbart,
  behandlingID,
  lagreOgFatteVedtak,
  behandlingstype,
  lagretVedtakstype,
  begrunnelseKode,
}) => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)
  const [mottakerinstitusjoner, setMottakerinstitusjoner] = useState([]);
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState(null);

  const hentMottakerinstitusjoner = async () => {
    try {
      const soknadsland = gyldigeSoknadsland[0].kode;
      const institusjoner = await Api.Eessi.mottakerinstitusjoner.hent(EKV.Koder.buctyper.legislation.LA_BUC_04, soknadsland);
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

  const [vedtaksbrevFritekst, setVedtaksbrevFritekst] = useEventTargetValueState('');
  const [vedtakstype, setVedtakstype] = useEventTargetValueState(lagretVedtakstype || '');
  const [vedtakstypeFeil, setVedtakstypeFeil] = useState(undefined);
  const [vedtakstypeBegrunnelse, setVedtakstypeBegrunnelse] = useEventTargetValueState(begrunnelseKode || '');
  const [vedtakstypeBegrunnelseFeil, setVedtakstypeBegrunnelseFeil] = useState(undefined);

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgsbestemmelse,
  } = lovvalget;

  const antallManeder = datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, alleLovvalg);
  const skalSendeSed = mottakerinstitusjoner.length > 0;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
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

  const vedtakstypeEndret = e => {
    setVedtakstypeFeil(undefined);
    setVedtakstype(e);
  };

  const vedtakstypeBegrunnelseEndret = e => {
    setVedtakstypeBegrunnelseFeil(undefined);
    setVedtakstypeBegrunnelse(e);
  };

  const validerVedtakstype = () => {
    const vedtakstypeValid = vedtakstype !== '';
    if (!vedtakstypeValid) setVedtakstypeFeil({ feilmelding: 'Velg en vedtakstype' });
    return vedtakstypeValid;
  };

  const validerVedtakstypeBegrunnelse = () => {
    const vedtakstypeBegrunnelseValid = vedtakstypeBegrunnelse !== '';
    if (!vedtakstypeBegrunnelseValid) setVedtakstypeBegrunnelseFeil({ feilmelding: 'Velg en begrunnelse' });
    return vedtakstypeBegrunnelseValid;
  };

  const validerAlt = () => {
    const vedtakstypeFeilValid = erNyVurdering ? validerVedtakstype() : true;
    const vedtakstypeBegrunnelseFeilValid = erNyVurdering ? validerVedtakstypeBegrunnelse() : true;

    return vedtakstypeFeilValid && vedtakstypeBegrunnelseFeilValid;
  };

  const fattVedtak = () => {
    if (!validerAlt()) return;

    lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: vedtaksbrevFritekst,
      mottakerinstitusjon: valgtMottakerinstitusjon,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    });
  };

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
          erNyVurdering &&
          <Nav.Row>
            <Nav.Column xs="6">
              <Vedtaktype
                className="vedtaktype"
                onChange={vedtakstypeEndret}
                value={vedtakstype}
                redigerbart={redigerbart}
                feil={vedtakstypeFeil}
              />
              <Vedtaktypebegrunnelse
                onChange={vedtakstypeBegrunnelseEndret}
                value={vedtakstypeBegrunnelse}
                redigerbart={redigerbart}
                feil={vedtakstypeBegrunnelseFeil}
              />
            </Nav.Column>
          </Nav.Row>
        }
        <Nav.Row className="fritekst">
          <Nav.Column xs="8">
            <Nav.Textarea
              label="Fritekst til vedtaksbrev"
              placeholder="Skriv inn tekst til vedtaksbrevet..."
              value={vedtaksbrevFritekst}
              onChange={setVedtaksbrevFritekst}
              maxLength={500}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {
          skalSendeSed &&
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Nav.Select disabled={!redigerbart} label="Velg utenlandsk institusjon som skal motta SED" onChange={valgtMottakerinstitusjonHandler}>
                <option key={uuid()} value="" disabled>Velg...</option>
                {mottakerinstitusjoner.map(institusjon => <option key={institusjon.id} value={institusjon.id}>{institusjon.navn}</option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        }
        <Nav.Row>
          <Nav.Column xs="6">
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
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
  behandlingstype: PT.string.isRequired,
  lagretVedtakstype: MPT.Vedtakstype,
  begrunnelseKode: PT.string,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
  lagretVedtakstype: undefined,
  begrunnelseKode: '',
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  lagretVedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  begrunnelseKode: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
});

export default connect(mapStateToProps)(VurderingVedtak);
