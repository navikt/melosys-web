import React, { useEffect, useState, Fragment, ChangeEvent } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { KTObject } from '@navikt/melosys-kodeverk';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Ikoner from '../../../../resources/images';
import * as Utils from '../../../../utils';

import { AvgiftsBeregning, AvgiftsLoenn, Avgiftsperiode, InntekstInformasjon } from '../../../../@types/avgift';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { finnTermFraListe } from '../../../../kodeverk';
import { BOOLSK_STRING } from '../../../../constants';

import './vurderingTrygdeavgift.css';


const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  tilbake: () => void,
  redigerbart: boolean,
}
const VurderingTrygdeavgift =
  ({
    bekreft, tilbake, redigerbart, behandlingID,
  }: Props & PropsFromRedux) => {
    const [avgiftsLoenn, setAvgiftsLoenn] = useState<AvgiftsLoenn>();
    const [avgiftsBeregning, setAvgiftsBeregning] = useState<AvgiftsBeregning|undefined>();
    const [erTabellÅpen, setErTabellÅpen] = useState(new Map());
    const [postAvgiftsBeregning, setPostAvgiftsBeregning] = useState<AvgiftsBeregning>({ avgiftspliktigLønnNorge: -1, avgiftspliktigLønnUtland: -1 });
    const [feil, setFeil] = useState();

    useEffect(() => {
      async function lastInnAvgiftsLoenn() {
        const hentetAvgiftsLoenn = await Api.Avgift.hentLoenn(behandlingID);
        setAvgiftsLoenn(hentetAvgiftsLoenn);
      }
      lastInnAvgiftsLoenn();
    }, []);

    function erInntektsInformasjonValid(inntektsinformasjon: InntekstInformasjon | undefined) {
      return (inntektsinformasjon
        && (inntektsinformasjon.erSkattepliktig || inntektsinformasjon.erSkattepliktig === false)
        && (inntektsinformasjon.betalerArbeidsgiverAvgift || inntektsinformasjon.betalerArbeidsgiverAvgift === false)
        && (inntektsinformasjon.særligAvgiftsgruppe === null || (!!inntektsinformasjon.særligAvgiftsgruppe && inntektsinformasjon.særligAvgiftsgruppe !== 'NULL')));
    }

    function erAvgiftsLoennGyldig(avgiftsLønn: AvgiftsLoenn) {
      if (!avgiftsLønn.lønnsforhold) return false;
      switch (avgiftsLønn.lønnsforhold) {
        case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
          return !!erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonNorge);
        case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
          return !!erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonUtland);
        case MKV.Koder.loenn_forhold.DELT_LØNN:
          return !!(erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonNorge) && erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonUtland));
        default:
          return false;
      }
    }

    useEffect(() => {
      if (avgiftsLoenn && erAvgiftsLoennGyldig(avgiftsLoenn)) {
        Api.Avgift.sendLoenn(behandlingID, avgiftsLoenn);
      }
    }, [avgiftsLoenn]);

    function handleLoennsforholdChange(event: ChangeEvent<HTMLInputElement>) {
      setAvgiftsLoenn({ ...avgiftsLoenn, lønnsforhold: event.target.value });
    }

    function handleErSkattepliktigRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      if (erNorskVirksomhet) {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonNorge: { ...avgiftsLoenn.inntektsInformasjonNorge, erSkattepliktig: Utils.streng.tryParseBool(event.target.value) } });
      } else {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonUtland: { ...avgiftsLoenn.inntektsInformasjonUtland, erSkattepliktig: Utils.streng.tryParseBool(event.target.value) } });
      }
    }

    function handleBetalerArbeidsgiverAvgiftRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      if (erNorskVirksomhet) {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonNorge: { ...avgiftsLoenn.inntektsInformasjonNorge, betalerArbeidsgiverAvgift: Utils.streng.tryParseBool(event.target.value) } });
      } else {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonUtland: { ...avgiftsLoenn.inntektsInformasjonUtland, betalerArbeidsgiverAvgift: Utils.streng.tryParseBool(event.target.value) } });
      }
    }

    function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      if (erNorskVirksomhet) {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonNorge: { ...avgiftsLoenn.inntektsInformasjonNorge, særligAvgiftsgruppe: Utils.streng.tryParseBool(event.target.value) ? 'NULL' : null } });
      } else {
        setAvgiftsLoenn(avgiftsLoenn &&
          { ...avgiftsLoenn, inntektsInformasjonUtland: { ...avgiftsLoenn.inntektsInformasjonUtland, særligAvgiftsgruppe: Utils.streng.tryParseBool(event.target.value) ? 'NULL' : null } });
      }
    }

    function handleSærligAvgiftsgruppeSelectChange(event: ChangeEvent<HTMLSelectElement>, erNorskVirksomhet: boolean) {
      if (erNorskVirksomhet) {
        setAvgiftsLoenn(avgiftsLoenn && { ...avgiftsLoenn, inntektsInformasjonNorge: { ...avgiftsLoenn.inntektsInformasjonNorge, særligAvgiftsgruppe: event.target.value } });
      } else {
        setAvgiftsLoenn(avgiftsLoenn && { ...avgiftsLoenn, inntektsInformasjonUtland: { ...avgiftsLoenn.inntektsInformasjonUtland, særligAvgiftsgruppe: event.target.value } });
      }
    }

    async function handleBeregnClick(erNorskVirksomhet: boolean, avgiftspliktigInntekt: number) {
      const postData = erNorskVirksomhet
        ? { ...postAvgiftsBeregning, avgiftspliktigLønnNorge: avgiftspliktigInntekt }
        : { ...postAvgiftsBeregning, avgiftspliktigLønnUtland: avgiftspliktigInntekt };
      setPostAvgiftsBeregning(postData);
      const hentetAvgiftsBeregning = await Api.Avgift.sendBeregning(behandlingID, postData);
      setAvgiftsBeregning(hentetAvgiftsBeregning);
      setErTabellÅpen(new Map(erTabellÅpen.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', true)));
    }

    const PeriodeTabellComponent = ({ perioder }: { perioder: string[][] | undefined }) => {
      if (!perioder) return null;
      return (
        <table className="periode_tabell">
          <tbody>
            <tr>
              <th key={Utils._uuid()} style={{ width: '30%' }} scope="col">Periode</th>
              <th key={Utils._uuid()} style={{ width: '40%' }} scope="col">Dekning</th>
              <th key={Utils._uuid()} style={{ width: '10%' }} scope="col">Sats</th>
              <th key={Utils._uuid()} style={{ width: '20%' }} scope="col">Avgift per måned</th>
            </tr>
            {perioder.map(avgiftsPeriode =>
              <tr className="border_top" key={Utils._uuid()}>
                {avgiftsPeriode.map((listeElement: string) =>
                  <td key={Utils._uuid()}>{listeElement}</td>)
                }
              </tr>)
            }
          </tbody>
        </table>
      );
    };

    const InntektsInformasjonComponent = ({ erVirksomhetNorsk }: { erVirksomhetNorsk: boolean }) => {
      function initializeAvgiftspliktigInntekt() {
        if (!avgiftsBeregning) return 0;
        const number = erVirksomhetNorsk ? avgiftsBeregning.avgiftspliktigLønnNorge : avgiftsBeregning.avgiftspliktigLønnUtland;
        return number !== -1 ? number : 0;
      }

      const [avgiftspliktigInntekt, setAvgiftspliktigInntekt] = useState<number>(initializeAvgiftspliktigInntekt());
      const Hjelpetekst = () => (
        <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Under}>
          {'Du skal velge "ja" dersom søker tilhører en spesiell gruppe og det kan ha betydning for trygdeavgiften. Dette gjelder følgende grupper:'}
          <ul>
            <li>Ansatte i FN som betaler staff assessment</li>
            <li>Misjonærer som skal arbeide i utlandet i minst to år</li>
            <li>Arbeidstakere i Malaysia</li>
          </ul>
        </Nav.Hjelpetekst>);

      function mapTabell(avgiftsperioder: Avgiftsperiode[] | undefined) {
        return avgiftsperioder && avgiftsperioder.map(avgiftsperiode =>
          [`${Utils.dato.formatterDatoTilNorsk(avgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(avgiftsperiode.tom)}`,
            finnTermFraListe(MKV.KTObjects.trygdedekninger, avgiftsperiode.trygdedekning),
            avgiftsperiode.avgiftssats,
            `${avgiftsperiode.avgiftPerMd} kroner`]);
      }

      if (!avgiftsLoenn) return null;
      return (
        <div className="understrek">
          <Nav.Row>
            <Nav.typo.Undertittel className="sub_undertittel">{erVirksomhetNorsk ? 'Fra Norge' : 'Fra utlandet'}</Nav.typo.Undertittel>
            <div className="column">
              <Nav.Fieldset legend="Er søker skattepliktig?">
                <Nav.Radio
                  className="column"
                  label="Ja"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}erSkattepliktig`}
                  onChange={event => handleErSkattepliktigRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.erSkattepliktig)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.erSkattepliktig)}
                  value={BOOLSK_STRING.SANN}
                  key={BOOLSK_STRING.SANN}
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  className="column"
                  label="Nei"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}erSkattepliktig`}
                  onChange={event => handleErSkattepliktigRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.erSkattepliktig === false)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.erSkattepliktig === false)}
                  value={BOOLSK_STRING.USANN}
                  key={BOOLSK_STRING.USANN}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </div>

            <div className="column extra_left_margin">
              <Nav.Fieldset legend="Betaler virksomheten arbeideravgift?">
                <Nav.Radio
                  className="column"
                  label="Ja"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}betalerArbeidsgiverAvgift`}
                  onChange={event => handleBetalerArbeidsgiverAvgiftRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.betalerArbeidsgiverAvgift)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.betalerArbeidsgiverAvgift)}
                  value={BOOLSK_STRING.SANN}
                  key={BOOLSK_STRING.SANN}
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  className="column"
                  label="Nei"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}betalerArbeidsgiverAvgift`}
                  onChange={event => handleBetalerArbeidsgiverAvgiftRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.betalerArbeidsgiverAvgift === false)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.betalerArbeidsgiverAvgift === false)}
                  value={BOOLSK_STRING.USANN}
                  key={BOOLSK_STRING.USANN}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </div>

            <div className="column extra_left_margin">
              <Nav.Fieldset legend={<div>Tilhører søker en spesiell gruppe?<Hjelpetekst /></div>}>
                <Nav.Radio
                  className="column"
                  label="Ja"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}særligAvgiftsgruppe`}
                  onChange={event => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && !!avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe)
                    : (avgiftsLoenn.inntektsInformasjonUtland && !!avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe)}
                  value={BOOLSK_STRING.SANN}
                  key={BOOLSK_STRING.SANN}
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  className="column"
                  label="Nei"
                  name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}særligAvgiftsgruppe`}
                  onChange={event => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
                  checked={erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe === null)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe === null)}
                  value={BOOLSK_STRING.USANN}
                  key={BOOLSK_STRING.USANN}
                  disabled={!redigerbart}
                />
                {
                  (erVirksomhetNorsk
                    ? (avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe)
                    : (avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe)) &&
                  <Nav.Select
                    label=""
                    onChange={event => handleSærligAvgiftsgruppeSelectChange(event, erVirksomhetNorsk)}
                    value={(erVirksomhetNorsk
                      ? avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe
                      : avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe) || ''}
                  >
                    <option
                      key=""
                      value=""
                      disabled={(erVirksomhetNorsk
                        ? avgiftsLoenn.inntektsInformasjonNorge && avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe
                        : avgiftsLoenn.inntektsInformasjonUtland && avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe) !== 'NULL'}
                    >
                      Velg gruppe
                    </option>
                    {MKV.KTObjects.saerligeavgiftsgrupper.map((saerligavgiftsgruppe: KTObject) =>
                      <option key={saerligavgiftsgruppe.kode} value={saerligavgiftsgruppe.kode}>{saerligavgiftsgruppe.term}</option>)}
                  </Nav.Select>
                }

              </Nav.Fieldset>
            </div>
          </Nav.Row>

          { (erVirksomhetNorsk
            ? avgiftsLoenn.inntektsInformasjonNorge &&
              avgiftsLoenn.inntektsInformasjonNorge.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
            : avgiftsLoenn.inntektsInformasjonUtland &&
              avgiftsLoenn.inntektsInformasjonUtland.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
          )
            ?
            <Nav.AlertStripeInfo>
              {erVirksomhetNorsk
                ? avgiftsLoenn.inntektsInformasjonNorge &&
                  finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt, avgiftsLoenn.inntektsInformasjonNorge.vurderingTrygdeavgiftNorskInntekt)
                : avgiftsLoenn.inntektsInformasjonUtland &&
                  finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt, avgiftsLoenn.inntektsInformasjonUtland.vurderingTrygdeavgiftUtenlandskInntekt)}
            </Nav.AlertStripeInfo>
            :
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Input
                  label="Avgiftspliktig inntekt per måned"
                  value={avgiftspliktigInntekt}
                  bredde="fullbredde"
                  onChange={event => setAvgiftspliktigInntekt(parseInt(event.target.value, 10))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  feil={feil}
                  disabled={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column xs="4">
                <Nav.Knapp
                  className="beregn_knapp"
                  onClick={() => handleBeregnClick(erVirksomhetNorsk, avgiftspliktigInntekt)}
                >
                  <Ikoner.Kalkulator className="beregn_ikon" />
                  <span>Beregn foreløpig trygdeavgift</span>
                </Nav.Knapp>
              </Nav.Column>
            </Nav.Row>
          }

          {
            (erVirksomhetNorsk ? erTabellÅpen.get('norskVirksomhet') : erTabellÅpen.get('utenlandskVirksomhet')) && avgiftsBeregning &&
            <Nav.Row>
              <Nav.Column xs="12">
                <PeriodeTabellComponent perioder={mapTabell(erVirksomhetNorsk ? avgiftsBeregning.avgiftsperioderNorge : avgiftsBeregning.avgiftsperioderNorge)} />
              </Nav.Column>
            </Nav.Row>
          }
        </div>
      );
    };

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Trygdeavgift</Nav.typo.Undertittel>

        <Nav.Row className="understrek">
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
              <Nav.Radio
                label="Norsk virksomhet"
                name="loennsforhold"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                onChange={handleLoennsforholdChange}
                defaultChecked={avgiftsLoenn && avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              />
              <Nav.Radio
                label="Utenlandsk virksomhet"
                name="loennsforhold"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                onChange={handleLoennsforholdChange}
                defaultChecked={avgiftsLoenn && avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              />
              <Nav.Radio
                label="Norsk og utenlandsk virksomhet"
                name="loennsforhold"
                value={MKV.Koder.loenn_forhold.DELT_LØNN}
                onChange={handleLoennsforholdChange}
                defaultChecked={avgiftsLoenn && avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>

        {(() => {
          if (!avgiftsLoenn) return null;
          switch (avgiftsLoenn.lønnsforhold) {
            case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
              return <InntektsInformasjonComponent key="norskVirksomhet" erVirksomhetNorsk />;
            case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
              return <InntektsInformasjonComponent key="utenlandskVirksomhet" erVirksomhetNorsk={false} />;
            case MKV.Koder.loenn_forhold.DELT_LØNN:
              return (
                <Fragment>
                  <InntektsInformasjonComponent key="norskVirksomhet" erVirksomhetNorsk />
                  <InntektsInformasjonComponent key="utenlandskVirksomhet" erVirksomhetNorsk={false} />
                </Fragment>);
            default:
              return null;
          }
        })()}

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

export default connector(VurderingTrygdeavgift);
