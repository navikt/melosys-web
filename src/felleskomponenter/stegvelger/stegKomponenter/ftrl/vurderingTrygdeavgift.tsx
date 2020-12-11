import React, { useEffect, useState, ChangeEvent } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { KTObject } from '@navikt/melosys-kodeverk';
import { change, getFormValues, reduxForm } from 'redux-form';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { AvgiftsBeregning, AvgiftsLoenn, Avgiftsperiode } from 'Domene';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Ikoner from '../../../../resources/images';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Skjema from '../../../skjema';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { formSelectors } from '../../../../ducks/form';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../../yup';
import { BOOLSK, BOOLSK_STRING } from '../../../../constants';

import './vurderingTrygdeavgift.css';


interface TrygdeavgiftsgrunnlagProps {
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

const TrygdeavgiftsgrunnlagComponent =
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
  }: TrygdeavgiftsgrunnlagProps) => {
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
          KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, avgiftsperiode.trygdedekning),
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
      <div className="overstrek">
        <Nav.Row>
          <Nav.typo.Undertittel className="sub_undertittel">{erVirksomhetNorsk ? 'Fra Norge' : 'Fra utlandet'}</Nav.typo.Undertittel>
          <div className="column">
            <Nav.Fieldset legend="Er søker skattepliktig?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.erIkkeSkattepliktig' : 'trygdeavgiftsgrunnlagUtland.erIkkeSkattepliktig'}
              />
            </Nav.Fieldset>
          </div>

          <div className="column extra_left_margin">
            <Nav.Fieldset legend="Betaler virksomheten arbeideravgift?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.betalerIkkeArbeidsgiverAvgift' : 'trygdeavgiftsgrunnlagUtland.betalerIkkeArbeidsgiverAvgift'}
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
                  disabled={!redigerbart}
                  feltNavn={erVirksomhetNorsk ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe'}
                  emptyFieldText="Velg gruppe"
                  emptyFieldDisabled={(erVirksomhetNorsk
                    ? formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe
                    : formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe) !== 'TRUE'}
                >
                  {MKV.KTObjects.saerligeavgiftsgrupper.map((saerligavgiftsgruppe: KTObject) =>
                    <option key={saerligavgiftsgruppe.kode} value={saerligavgiftsgruppe.kode}>{saerligavgiftsgruppe.term}</option>)}
                </Skjema.Select>
              }

            </Nav.Fieldset>
          </div>
        </Nav.Row>

        { (erVirksomhetNorsk
          ? formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge &&
            formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
          : formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland.vurderingTrygdeavgiftUtenlandskInntekt
            === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
        )
          ?
          <div>
            <Nav.AlertStripeInfo className="alertstripe__info">
              {erVirksomhetNorsk
                ? formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge &&
                KV.finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt, formValues.avgiftsLoenn.trygdeavgiftsgrunnlagNorge.vurderingTrygdeavgiftNorskInntekt)
                : formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland &&
                KV.finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt, formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland.vurderingTrygdeavgiftUtenlandskInntekt)}
            </Nav.AlertStripeInfo>
            {
              !erVirksomhetNorsk && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift &&
              <Nav.AlertStripeAdvarsel className="alertstripe__advarsel">Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.</Nav.AlertStripeAdvarsel>
            }
          </div>
          :
          <Nav.Row>
            {
              !erVirksomhetNorsk && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland && formValues.avgiftsLoenn.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift &&
              <Nav.AlertStripeAdvarsel className="alertstripe__advarsel">Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.</Nav.AlertStripeAdvarsel>
            }
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
                disabled={!redigerbart || !erAvgiftsLoennGyldig}
              >
                {erAvgiftsLoennGyldig && redigerbart ? <Ikoner.Kalkulator className="beregn_ikon" /> : <Ikoner.Kalkulator_Disabled className="beregn_ikon" /> }
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

    useEffect(() => {
      async function lastInnAvgiftsLoenn() {
        const response = await Api.Trygdeavgift.hentGrunnlag(behandlingID);
        changeField('avgiftsLoenn', response);
        if (response) {
          if (response.trygdeavgiftsgrunnlagNorge && response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe !== undefined) {
            erSærligAvgiftsGruppeValgt.set('norskVirksomhet', !!response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe);
          }
          if (response.trygdeavgiftsgrunnlagUtland && response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe !== undefined) {
            erSærligAvgiftsGruppeValgt.set('utenlandskVirksomhet', !!response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe);
          }
          setErSærligAvgiftsGruppeValgt(new Map(erSærligAvgiftsGruppeValgt));
        }
      }
      lastInnAvgiftsLoenn();
    }, []);

    useEffect(() => {
      oppdater();
      setErAvgiftsLoennGyldig(vurder_trygdeavgift_valid);
    }, [vurder_trygdeavgift_valid]);

    useEffect(() => {
      if (formValues && formValues.avgiftsLoenn && erAvgiftsLoennGyldig) {
        Api.Trygdeavgift.sendGrunnlag(behandlingID, formValues.avgiftsLoenn);
      }
    }, [formValues && formValues.avgiftsLoenn, erAvgiftsLoennGyldig]);

    function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
      setErSærligAvgiftsGruppeValgt(new Map(erSærligAvgiftsGruppeValgt.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', erSærligAvgiftsgruppe)));
      changeField(
        erNorskVirksomhet ? 'avgiftsLoenn.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe' : 'avgiftsLoenn.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe',
        erSærligAvgiftsgruppe ? 'TRUE' : null
      );
    }

    function handleAvgiftspliktigLønnInputChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      setAvgiftspliktigLoenn(erNorskVirksomhet
        ? { ...avgiftspliktigLoenn, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) }
        : { ...avgiftspliktigLoenn, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) });
      if (erNorskVirksomhet) {
        changeField('avgiftsBeregning', { ...formValues.avgiftsBeregning, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) });
      } else {
        changeField('avgiftsBeregning', { ...formValues.avgiftsBeregning, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) });
      }
    }

    async function handleBeregnClick(erNorskVirksomhet: boolean) {
      const hentetAvgiftsBeregning = await Api.Trygdeavgift.sendBeregning(behandlingID, avgiftspliktigLoenn);
      changeField('avgiftsBeregning', hentetAvgiftsBeregning);
      setErTabellÅpen(new Map(erTabellÅpen.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', true)));
    }

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Trygdeavgift</Nav.typo.Undertittel>

        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
              <Skjema.Radio
                label="Norsk virksomhet"
                feltNavn="avgiftsLoenn.lønnsforhold"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                key={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              />
              <Skjema.Radio
                feltNavn="avgiftsLoenn.lønnsforhold"
                label="Utenlandsk virksomhet"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                key={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              />
              <Skjema.Radio
                label="Norsk og utenlandsk virksomhet"
                feltNavn="avgiftsLoenn.lønnsforhold"
                value={MKV.Koder.loenn_forhold.DELT_LØNN}
                key={MKV.Koder.loenn_forhold.DELT_LØNN}
                id={MKV.Koder.loenn_forhold.DELT_LØNN}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsLoenn && formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>

        {
          formValues && formValues.avgiftsLoenn &&
          (formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE || formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <TrygdeavgiftsgrunnlagComponent
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
          formValues && formValues.avgiftsLoenn &&
          (formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET || formValues.avgiftsLoenn.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <TrygdeavgiftsgrunnlagComponent
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
  validate: values => lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_trygdeavgift)(values),
})(VurderingTrygdeavgift);

export default connector(VurderingTrygdeavgiftForm);
