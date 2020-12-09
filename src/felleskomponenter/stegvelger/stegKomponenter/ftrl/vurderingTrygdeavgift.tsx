import React, { useEffect, useState, ChangeEvent } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { KTObject } from '@navikt/melosys-kodeverk';
import { change, getFormValues, reduxForm } from 'redux-form';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Ikoner from '../../../../resources/images';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Skjema from '../../../skjema';

import { AvgiftsBeregning, AvgiftsLoenn, Avgiftsperiode } from '../../../../@types/avgift';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { finnTermFraListe } from '../../../../kodeverk';
import { lagYupToReduxformErrorMapper,  Skjemaer as YupSkjemaer } from '../../../../yup';
import { BOOLSK, BOOLSK_STRING } from '../../../../constants';

import './vurderingTrygdeavgift.css';
import { formSelectors } from '../../../../ducks/form';


interface InntektsInformasjonProps {
  formValues: {
    avgiftsBeregning: AvgiftsBeregning | undefined,
    avgiftsLoenn: AvgiftsLoenn | undefined
  },
  avgiftspliktigLoenn: AvgiftsBeregning,
  erAvgiftsLoennGyldig: boolean,
  erTabellÅpen: Map<string, boolean>,
  erVirksomhetNorsk: boolean,
  erSærligAvgiftsGruppeValgt: Map<string, boolean>,
  handleBeregnClick: (erVirksomhetNorsk: boolean) => void,
  handleSærligAvgiftsgruppeRadioChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void,
  handleAvgiftspliktigLønnInputChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void,
  redigerbart: boolean,
}

const InntektsInformasjonComponent =
  ({
    formValues,
    avgiftspliktigLoenn,
    erAvgiftsLoennGyldig,
    erTabellÅpen,
    erVirksomhetNorsk,
     erSærligAvgiftsGruppeValgt,
    handleBeregnClick,
    handleSærligAvgiftsgruppeRadioChange,
    handleAvgiftspliktigLønnInputChange,
    redigerbart,
  }: InntektsInformasjonProps) => {
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

    if (!formValues.avgiftsLoenn) return null;
    return (
      <div className="understrek">
        <Nav.Row>
          <Nav.typo.Undertittel className="sub_undertittel">{erVirksomhetNorsk ? 'Fra Norge' : 'Fra utlandet'}</Nav.typo.Undertittel>
          <div className="column">
            <Nav.Fieldset legend="Er søker skattepliktig?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.inntektsInformasjonNorge.erSkattepliktig' : 'avgiftsLoenn.inntektsInformasjonUtland.erSkattepliktig'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'inntektsInformasjonNorge.erSkattepliktig' : 'inntektsInformasjonUtland.erSkattepliktig'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.inntektsInformasjonNorge.erSkattepliktig' : 'avgiftsLoenn.inntektsInformasjonUtland.erSkattepliktig'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'inntektsInformasjonNorge.erIkkeSkattepliktig' : 'inntektsInformasjonUtland.erIkkeSkattepliktig'}
              />
            </Nav.Fieldset>
          </div>

          <div className="column extra_left_margin">
            <Nav.Fieldset legend="Betaler virksomheten arbeideravgift?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.inntektsInformasjonNorge.betalerArbeidsgiverAvgift' : 'avgiftsLoenn.inntektsInformasjonUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'inntektsInformasjonNorge.betalerArbeidsgiverAvgift' : 'inntektsInformasjonUtland.betalerArbeidsgiverAvgift'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.inntektsInformasjonNorge.betalerArbeidsgiverAvgift' : 'avgiftsLoenn.inntektsInformasjonUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'inntektsInformasjonNorge.betalerIkkeArbeidsgiverAvgift' : 'inntektsInformasjonUtland.betalerIkkeArbeidsgiverAvgift'}
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
                  ? erSærligAvgiftsGruppeValgt.get('norskVirksomhet') === true
                  : erSærligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === true}
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
                  ? erSærligAvgiftsGruppeValgt.get('norskVirksomhet') === false
                  : erSærligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === false}
                value={BOOLSK_STRING.USANN}
                key={BOOLSK_STRING.USANN}
                disabled={!redigerbart}
              />
              {
                (erVirksomhetNorsk
                  ? erSærligAvgiftsGruppeValgt.get('norskVirksomhet') === true
                  : erSærligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === true) &&
                <Skjema.Select
                  label=""
                  feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe' : 'avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe'}
                  emptyFieldText={'Velg gruppe'}
                  emptyFieldDisabled={(erVirksomhetNorsk
                    ? formValues.avgiftsLoenn.inntektsInformasjonNorge && formValues.avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe
                    : formValues.avgiftsLoenn.inntektsInformasjonUtland && formValues.avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe) !== 'TRUE'}
                >
                  {MKV.KTObjects.saerligeavgiftsgrupper.map((saerligavgiftsgruppe: KTObject) =>
                    <option key={saerligavgiftsgruppe.kode} value={saerligavgiftsgruppe.kode}>{saerligavgiftsgruppe.term}</option>)}
                </Skjema.Select>
              }

            </Nav.Fieldset>
          </div>
        </Nav.Row>

        { (erVirksomhetNorsk
          ? formValues.avgiftsLoenn.inntektsInformasjonNorge &&
            formValues.avgiftsLoenn.inntektsInformasjonNorge.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
          : formValues.avgiftsLoenn.inntektsInformasjonUtland &&
            formValues.avgiftsLoenn.inntektsInformasjonUtland.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
        )
          ?
          <Nav.AlertStripeInfo>
            {erVirksomhetNorsk
              ? formValues.avgiftsLoenn.inntektsInformasjonNorge &&
              finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt, formValues.avgiftsLoenn.inntektsInformasjonNorge.vurderingTrygdeavgiftNorskInntekt)
              : formValues.avgiftsLoenn.inntektsInformasjonUtland &&
              finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt, formValues.avgiftsLoenn.inntektsInformasjonUtland.vurderingTrygdeavgiftUtenlandskInntekt)}
          </Nav.AlertStripeInfo>
          :
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Input
                label="Avgiftspliktig inntekt per måned"
                value={(erVirksomhetNorsk && avgiftspliktigLoenn.avgiftspliktigLønnNorge !== -1 && avgiftspliktigLoenn.avgiftspliktigLønnNorge) ||
                  (!erVirksomhetNorsk && avgiftspliktigLoenn.avgiftspliktigLønnUtland !== -1 && avgiftspliktigLoenn.avgiftspliktigLønnUtland) || 0}
                bredde="fullbredde"
                onChange={event => handleAvgiftspliktigLønnInputChange(event, erVirksomhetNorsk)}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={!redigerbart}
              />
            </Nav.Column>
            <Nav.Column xs="4">
              <Nav.Knapp
                className="beregn_knapp"
                onClick={() => handleBeregnClick(erVirksomhetNorsk)}
                disabled={!erAvgiftsLoennGyldig}
              >
                {erAvgiftsLoennGyldig ? <Ikoner.Kalkulator className="beregn_ikon" /> : <Ikoner.Kalkulator_Disabled className="beregn_ikon" /> }
                <span>Beregn foreløpig trygdeavgift</span>
              </Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        }

        {
          (erVirksomhetNorsk ? erTabellÅpen.get('norskVirksomhet') : erTabellÅpen.get('utenlandskVirksomhet')) && formValues.avgiftsBeregning &&
          <Nav.Row>
            <Nav.Column xs="12">
              <PeriodeTabellComponent perioder={mapTabell(erVirksomhetNorsk ? formValues.avgiftsBeregning.avgiftsperioderNorge : formValues.avgiftsBeregning.avgiftsperioderNorge)} />
            </Nav.Column>
          </Nav.Row>
        }
      </div>
    );
  };

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.TRYGDEAVGIFT)(state),
  vurder_trygdeavgift_valid: formSelectors.VurderTrygdeavgiftFormValid(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.TRYGDEAVGIFT, field, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  formValues: {
    avgiftsLoenn: AvgiftsLoenn,
    avgiftsBeregning: AvgiftsBeregning | undefined,
  }
}

const VurderingTrygdeavgift =
  ({
    bekreft, oppdater, tilbake, redigerbart, behandlingID, formValues, changeField, vurder_trygdeavgift_valid,
  }: Props & PropsFromRedux) => {
    const [erTabellÅpen, setErTabellÅpen] = useState(new Map());
    const [erAvgiftsLoennGyldig, setErAvgiftsLoennGyldig] = useState(false);
    const [erSærligAvgiftsGruppeValgt, setErSærligAvgiftsGruppeValgt] = useState(new Map());
    const [avgiftspliktigLoenn, setAvgiftspliktigLoenn] = useState<AvgiftsBeregning>({ avgiftspliktigLønnNorge: -1, avgiftspliktigLønnUtland: -1 });
    const [feil, setFeil] = useState();

    useEffect(() => {
      async function lastInnAvgiftsLoenn() {
        const response = await Api.Avgift.hentLoenn(behandlingID);
        changeField('avgiftsLoenn', response);
        if (response){
          response.inntektsInformasjonNorge && response.inntektsInformasjonNorge.særligAvgiftsgruppe !== undefined
            && erSærligAvgiftsGruppeValgt.set('norskVirksomhet', !!response.inntektsInformasjonNorge.særligAvgiftsgruppe);
          response.inntektsInformasjonUtland && response.inntektsInformasjonUtland.særligAvgiftsgruppe !== undefined
            && erSærligAvgiftsGruppeValgt.set('utenlandskVirksomhet', !!response.inntektsInformasjonUtland.særligAvgiftsgruppe);
          setErSærligAvgiftsGruppeValgt(new Map(erSærligAvgiftsGruppeValgt))
        }
      }
      lastInnAvgiftsLoenn();
    }, []);

    useEffect(() => {
      oppdater();
      setErAvgiftsLoennGyldig(vurder_trygdeavgift_valid);
    },[vurder_trygdeavgift_valid]);

    useEffect(() => {
      if (formValues && formValues.avgiftsLoenn && erAvgiftsLoennGyldig) {
        Api.Avgift.sendLoenn(behandlingID, formValues.avgiftsLoenn);
      }
    }, [formValues && formValues.avgiftsLoenn, erAvgiftsLoennGyldig]);

    function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
      setErSærligAvgiftsGruppeValgt(new Map(erSærligAvgiftsGruppeValgt.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', erSærligAvgiftsgruppe)));
      changeField(erNorskVirksomhet ? 'avgiftsLoenn.inntektsInformasjonNorge.særligAvgiftsgruppe' : 'avgiftsLoenn.inntektsInformasjonUtland.særligAvgiftsgruppe', erSærligAvgiftsgruppe ? 'TRUE' : null);
    }

    function handleAvgiftspliktigLønnInputChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      setAvgiftspliktigLoenn(erNorskVirksomhet
        ? { ...avgiftspliktigLoenn, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) }
        : { ...avgiftspliktigLoenn, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) });
      erNorskVirksomhet
        ? changeField('avgiftsBeregning', {...formValues.avgiftsBeregning, avgiftspliktigLønnNorge: parseInt(event.target.value, 10)})
        : changeField('avgiftsBeregning', {...formValues.avgiftsBeregning, avgiftspliktigLønnUtland: parseInt(event.target.value, 10)});
    }

    async function handleBeregnClick(erNorskVirksomhet: boolean) {
      const hentetAvgiftsBeregning = await Api.Avgift.sendBeregning(behandlingID, avgiftspliktigLoenn);
      changeField('avgiftsBeregning', hentetAvgiftsBeregning);
      setErTabellÅpen(new Map(erTabellÅpen.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', true)));
    }

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Trygdeavgift</Nav.typo.Undertittel>

        <Nav.Row className="understrek">
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
              <Skjema.Radio
                label="Norsk virksomhet"
                feltNavn="avgiftsLoenn.lønnsforhold"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                key={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                className=""
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              />
              <Skjema.Radio
                feltNavn="avgiftsLoenn.lønnsforhold"
                label="Utenlandsk virksomhet"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                key={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                className=""
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              />
              <Skjema.Radio
                label="Norsk og utenlandsk virksomhet"
                feltNavn="avgiftsLoenn.lønnsforhold"
                value={MKV.Koder.loenn_forhold.DELT_LØNN}
                key={MKV.Koder.loenn_forhold.DELT_LØNN}
                id={MKV.Koder.loenn_forhold.DELT_LØNN}
                className=""
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>

        {
          formValues && formValues.avgiftsLoenn && (formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE || formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <InntektsInformasjonComponent
            key="norskVirksomhet"
            erVirksomhetNorsk
            formValues={formValues}
            avgiftspliktigLoenn={avgiftspliktigLoenn}
            erAvgiftsLoennGyldig={erAvgiftsLoennGyldig}
            erTabellÅpen={erTabellÅpen}
            erSærligAvgiftsGruppeValgt={erSærligAvgiftsGruppeValgt}
            handleBeregnClick={handleBeregnClick}
            handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
            handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
            redigerbart={redigerbart}
          />
        }
        {
          formValues && formValues.avgiftsLoenn && (formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET || formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <InntektsInformasjonComponent
            key="utenlandskVirksomhet"
            erVirksomhetNorsk={false}
            formValues={formValues}
            avgiftspliktigLoenn={avgiftspliktigLoenn}
            erAvgiftsLoennGyldig={erAvgiftsLoennGyldig}
            erTabellÅpen={erTabellÅpen}
            erSærligAvgiftsGruppeValgt={erSærligAvgiftsGruppeValgt}
            handleBeregnClick={handleBeregnClick}
            handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
            handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
            redigerbart={redigerbart}
          />
        }

        <div className="fane__knapplinje">
          <Nav.Knapp
            mini
            disabled={!redigerbart}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!redigerbart || !erAvgiftsLoennGyldig}
            className="fane__navigasjonsknapp"
            onClick={bekreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };

const VurderingTrygdeavgiftForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.TRYGDEAVGIFT,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: values => lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_trygdeavgift)(values)
})(VurderingTrygdeavgift);

export default connector(VurderingTrygdeavgiftForm);
