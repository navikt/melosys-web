import React from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';
import { Medlemskapsperiode } from 'Domene';
import { KTObject } from '@navikt/melosys-kodeverk';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Ikoner from '../../../../resources/images';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { formSelectors } from '../../../../ducks/form';
import { HTMLEditor } from '../../../htmleditor';
import PdfLenkeListe from '../../../pdfLenkeListe';

import './vurderingVedtak.css';

const TabellComponent = ({ rader, kolonner }: { rader: (string| JSX.Element)[][] | undefined, kolonner: { navn: string, bredde: string }[] }) => {
  if (!rader || !kolonner) return null;
  return (
    <table className="periode_tabell">
      <tbody>
        <tr>
          {kolonner.map(kolonne =>
            <th key={Utils._uuid()} style={{ width: kolonne.bredde }}>{kolonne.navn}</th>)
          }
        </tr>
        {rader.map(rad =>
          <tr className="border_bottom" key={Utils._uuid()}>
            {rad.map(listeElement =>
              <td key={Utils._uuid()}>{listeElement}</td>)
            }
          </tr>)
        }
      </tbody>
    </table>
  );
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  trygdeavgiftFormValues: formSelectors.VurderTrygdeavgiftFormSelector(state).values,
  formValues: getFormValues(KV.Form.VEDTAK)(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  alleLandkoder: KTObject[],
  formValues: {
    fritekstInnledning: HTMLElement,
    fritekstBegrunnelse: HTMLElement,
  }
}

const VurderingVedtak =
  ({
    bekreft,
    tilbake,
    redigerbart,
    medlemskapsperioder,
    innvilgelsesResultater,
    soknadsland,
    alleLandkoder,
    trygdeavgiftFormValues,
    behandlingID,
  }: Props & PropsFromRedux) => {
    const PdfDokument = [
      {
        navn: <Ikoner.Se />,
        type: 'MELDING_FORVENTET_SAKSBEHANDLINGSTID',
        data: {
          fritekst: 'dummy-fritekst',
          mottaker: 'BRUKER',
        },
      },
    ];

    function mapPeriodeRader(perioder: Medlemskapsperiode[] | undefined) {
      return perioder && perioder.map(medlemskapsperiode =>
        [`Fra. ${Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato)} Til. ${Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato)}`,
          KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, medlemskapsperiode.trygdedekning),
          KV.finnTermFraListe(innvilgelsesResultater, medlemskapsperiode.innvilgelsesResultat)]);
    }

    function mapVedtakRader() {
      return [
        [
          <Nav.typo.Normaltekst className="lenke">Vedtak om frivillig medlemskap</Nav.typo.Normaltekst>,
          'Deloitte',
          <span>
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={PdfDokument} />
          </span>,
        ],
        [
          <Nav.typo.Normaltekst className="lenke">Kopi av vedtak om frivillig medlemskap til Skatteetaten</Nav.typo.Normaltekst>,
          'Skatteetaten',
          <span>
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={PdfDokument} />
            <Ikoner.Bin_Large style={{ marginLeft: '0.5rem' }} />
          </span>,
        ],
        [
          <Nav.typo.Normaltekst className="lenke">Kopi av vedtak om frivillig medlemskap til bruker</Nav.typo.Normaltekst>,
          'Dag Fossum',
          <span>
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={PdfDokument} />
            <Ikoner.Bin_Large style={{ marginLeft: '0.5rem' }} />
          </span>,
        ],
        [
          <Nav.typo.Normaltekst className="lenke">Kopi av vedtak om frivillig medlemskap til bruker</Nav.typo.Normaltekst>,
          'Dag Fossum',
          <span>
            <Ikoner.Se />
            <Ikoner.Bin_Large style={{ marginLeft: '0.5rem' }} />
          </span>,
        ],
      ];
    }

    function getTrygdeavgiftString(sentence: string, boldWord: string) {
      const part1 = sentence.slice(0, sentence.indexOf(boldWord));
      const part2 = sentence.slice(sentence.indexOf(boldWord) + boldWord.length, sentence.length);
      return <>{part1}<b>{boldWord}</b>{part2}</>;
    }

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Frivillig medlemskap etter paragraf 2.8</Nav.typo.Undertittel>

        <TabellComponent rader={mapPeriodeRader(medlemskapsperioder)} kolonner={[{ navn: 'Periode', bredde: '42%' }, { navn: 'Dekning', bredde: '33%' }, { navn: 'Resultat', bredde: '23%' }]} />

        <Nav.Row>
          <Nav.Column xs="5">
            <Nav.typo.Element className="info">Arbeidsland</Nav.typo.Element>
            <Nav.typo.Normaltekst className="info">
              {alleLandkoder ? Utils.streng.storeForbokstaver(KV.finnTermFraListe(alleLandkoder, soknadsland[0])) : 'Finner ikke arbeidsland'}
            </Nav.typo.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.typo.Element className="info">Arbeid utføres i avtaleland</Nav.typo.Element>
            <Nav.typo.Normaltekst className="info">Ja</Nav.typo.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.typo.Element className="info">Familiemedlemmer</Nav.typo.Element>
            <Nav.typo.Normaltekst className="info">Nei</Nav.typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>

        { trygdeavgiftFormValues && trygdeavgiftFormValues.avgiftsgrunnlag
          && [MKV.Koder.loenn_forhold.LØNN_FRA_NORGE, MKV.Koder.loenn_forhold.DELT_LØNN].includes(trygdeavgiftFormValues.avgiftsgrunnlag.lønnsforhold) &&
          <div style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>
            <Ikoner.Inntekt className="trygdeavgift_ikon" />
            <Nav.typo.Normaltekst>
              {getTrygdeavgiftString(
                KV.finnTermFraListe(
                  MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt,
                  trygdeavgiftFormValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt
                ),
                'norsk inntekt'
              )}
            </Nav.typo.Normaltekst>
          </div>
        }
        { trygdeavgiftFormValues && trygdeavgiftFormValues.avgiftsgrunnlag
            && [MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET, MKV.Koder.loenn_forhold.DELT_LØNN].includes(trygdeavgiftFormValues.avgiftsgrunnlag.lønnsforhold) &&
          <div>
            <Ikoner.Inntekt className="trygdeavgift_ikon" />
            <Nav.typo.Normaltekst>
              {getTrygdeavgiftString(
                KV.finnTermFraListe(
                  MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt,
                  trygdeavgiftFormValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt
                ),
                'utenlandsk inntekt'
              )}
            </Nav.typo.Normaltekst>
          </div>
        }

        <Nav.typo.Element className="fritekst_overskrift" tag="h3">
          Fritekst til innleding <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre}></Nav.Hjelpetekst>
        </Nav.typo.Element>
        <HTMLEditor
          feltNavn="fritekstInnledning"
          className="fritekst_editor"
          placeholder="Skriv inn tilleggsinformasjon til innledning..."
        />

        <Nav.typo.Element className="fritekst_overskrift" tag="h3">
          Fritekst til begrunnelse <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre}></Nav.Hjelpetekst>
        </Nav.typo.Element>
        <HTMLEditor
          feltNavn="fritekstBegrunnelse"
          className="fritekst_editor"
          placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
        />

        <TabellComponent rader={mapVedtakRader()} kolonner={[{ navn: 'Dokumenter', bredde: '60%' }, { navn: 'Mottaker', bredde: '25%' }, { navn: '', bredde: '15%' }]} />

        <div className="fane__knapplinje">
          <Nav.Knapp
            mini
            disabled={!redigerbart}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!redigerbart}
            className="fane__navigasjonsknapp"
            onClick={bekreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };

const VurderingVedtakForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.VEDTAK,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
