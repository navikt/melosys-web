import React, { useEffect, useState, ChangeEvent } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { KTObject } from '@navikt/melosys-kodeverk';
import { change, getFormValues, reduxForm } from 'redux-form';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { Avgiftsgrunnlag, Avgiftsberegning, Avgiftsperiode, AvgiftsgrunnlagInfo } from 'Domene';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Ikoner from '../../../../resources/images';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Skjema from '../../../skjema';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { formSelectors } from '../../../../ducks/form';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../../yup';
import { OppdaterAvgiftsberegning } from '../../../../services/modules/trygdeavgift';
import { BOOLSK, BOOLSK_STRING } from '../../../../constants';

import './vurderingTrygdeavgift.css';

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

interface TrygdeavgiftsgrunnlagProps {
  formValues: {
    avgiftsberegning: Avgiftsberegning | undefined,
    avgiftsgrunnlag: Avgiftsgrunnlag | undefined
  },
  oppdatertAvgiftsberegning: OppdaterAvgiftsberegning,
  erTabellApen: Map<string, boolean>,
  erVirksomhetNorsk: boolean,
  erSaerligAvgiftsGruppeValgt: Map<string, boolean>,
  erTrygdeavgiftsgrunnlagNorgeUgyldig: boolean,
  erTrygdeavgiftsgrunnlagUtlandUgyldig: boolean
  handleBeregnClick: (erVirksomhetNorsk: boolean) => void,
  handleSærligAvgiftsgruppeRadioChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void,
  handleAvgiftspliktigLønnInputChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void,
  redigerbart: boolean,
  saerligeavgiftsgrupper: KTObject[]
}

const TrygdeavgiftsgrunnlagComponent =
  ({
    formValues,
    oppdatertAvgiftsberegning,
    erTabellApen,
    erVirksomhetNorsk,
    erSaerligAvgiftsGruppeValgt,
    erTrygdeavgiftsgrunnlagNorgeUgyldig,
    erTrygdeavgiftsgrunnlagUtlandUgyldig,
    handleBeregnClick,
    handleSærligAvgiftsgruppeRadioChange,
    handleAvgiftspliktigLønnInputChange,
    redigerbart,
    saerligeavgiftsgrupper,
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

    const VurderingsutfallIngenTrygdeavgift = () => {
      if (!formValues || !formValues.avgiftsgrunnlag) return null;
      return (
        <div>
          <Nav.AlertStripeInfo className="alertstripe__info">
            {erVirksomhetNorsk
              ? formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge &&
              KV.finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt, formValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt)
              : formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland &&
              KV.finnTermFraListe(MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt, formValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt)}
          </Nav.AlertStripeInfo>
          {
            !erVirksomhetNorsk && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift &&
            <Nav.AlertStripeAdvarsel className="alertstripe__advarsel">Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.</Nav.AlertStripeAdvarsel>
          }
        </div>
      );
    };

    if (!formValues.avgiftsgrunnlag) return null;
    return (
      <div className="overstrek">
        <Nav.Row>
          <Nav.typo.Undertittel className="sub_undertittel">{erVirksomhetNorsk ? 'Fra Norge' : 'Fra utlandet'}</Nav.typo.Undertittel>
          <Nav.Column xs="4">
            <Nav.Fieldset legend="Er søker skattepliktig?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.erIkkeSkattepliktig' : 'trygdeavgiftsgrunnlagUtland.erIkkeSkattepliktig'}
              />
            </Nav.Fieldset>
          </Nav.Column>

          <Nav.Column xs="4">
            <Nav.Fieldset legend="Betaler virksomheten arbeideravgift?">
              <Skjema.Radio
                className="column"
                label="Ja"
                feltNavn={erVirksomhetNorsk ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.SANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
              />
              <Skjema.Radio
                className="column"
                label="Nei"
                feltNavn={erVirksomhetNorsk ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift'}
                value={BOOLSK.USANN}
                disabled={!redigerbart}
                id={erVirksomhetNorsk ? 'trygdeavgiftsgrunnlagNorge.betalerIkkeArbeidsgiverAvgift' : 'trygdeavgiftsgrunnlagUtland.betalerIkkeArbeidsgiverAvgift'}
              />
            </Nav.Fieldset>
          </Nav.Column>

          <Nav.Column xs="4">
            <Nav.Fieldset legend={<div>Tilhører søker en spesiell gruppe?<Hjelpetekst /></div>}>
              <Nav.Radio
                className="column"
                label="Ja"
                name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}særligAvgiftsgruppe`}
                onChange={event => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
                checked={erVirksomhetNorsk
                  ? erSaerligAvgiftsGruppeValgt.get('norskVirksomhet') === true
                  : erSaerligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === true}
                value={BOOLSK_STRING.SANN}
                disabled={!redigerbart}
              />
              <Nav.Radio
                className="column"
                label="Nei"
                name={`${erVirksomhetNorsk ? 'norskVirksomhet' : 'utenlandskVirksomhet'}særligAvgiftsgruppe`}
                onChange={event => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
                checked={erVirksomhetNorsk
                  ? erSaerligAvgiftsGruppeValgt.get('norskVirksomhet') === false
                  : erSaerligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === false}
                value={BOOLSK_STRING.USANN}
                disabled={!redigerbart}
              />
              {
                (erVirksomhetNorsk
                  ? erSaerligAvgiftsGruppeValgt.get('norskVirksomhet') === true
                  : erSaerligAvgiftsGruppeValgt.get('utenlandskVirksomhet') === true) &&
                <Skjema.Select
                  label=""
                  disabled={!redigerbart}
                  feltNavn={erVirksomhetNorsk ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe'}
                  emptyFieldText="Velg gruppe"
                  emptyFieldDisabled={(erVirksomhetNorsk
                    ? formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe
                    : formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe) !== 'TRUE'}
                >
                  {saerligeavgiftsgrupper.map((saerligavgiftsgruppe: KTObject) =>
                    <option key={saerligavgiftsgruppe.kode} value={saerligavgiftsgruppe.kode}>{saerligavgiftsgruppe.term}</option>)}
                </Skjema.Select>
              }

            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>

        {
          (erVirksomhetNorsk
            ? formValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
            : formValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
          )
            ?
            <VurderingsutfallIngenTrygdeavgift />
            :
            <Nav.Row>
              {
                !erVirksomhetNorsk && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.betalerArbeidsgiverAvgift &&
                <Nav.AlertStripeAdvarsel className="alertstripe__advarsel">Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.</Nav.AlertStripeAdvarsel>
              }
              {
                (erVirksomhetNorsk ? !erTrygdeavgiftsgrunnlagNorgeUgyldig : !erTrygdeavgiftsgrunnlagUtlandUgyldig) &&
                <>
                  <Nav.Column xs="4">
                    <Nav.Input
                      label="Avgiftspliktig inntekt per måned"
                      value={(erVirksomhetNorsk && oppdatertAvgiftsberegning.avgiftspliktigLønnNorge !== null && oppdatertAvgiftsberegning.avgiftspliktigLønnNorge) ||
                      (!erVirksomhetNorsk && oppdatertAvgiftsberegning.avgiftspliktigLønnUtland !== null && oppdatertAvgiftsberegning.avgiftspliktigLønnUtland) || 0}
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
                      disabled={!redigerbart}
                    >
                      {redigerbart ? <Ikoner.Kalkulator className="beregn_ikon" /> : <Ikoner.Kalkulator_Disabled className="beregn_ikon" /> }
                      <span>Beregn foreløpig trygdeavgift</span>
                    </Nav.Knapp>
                  </Nav.Column>
                </>
              }
            </Nav.Row>
        }

        {
          (erVirksomhetNorsk ? erTabellApen.get('norskVirksomhet') : erTabellApen.get('utenlandskVirksomhet')) && formValues.avgiftsberegning &&
          <Nav.Row>
            <Nav.Column xs="12">
              <PeriodeTabellComponent perioder={mapTabell(erVirksomhetNorsk ? formValues.avgiftsberegning.avgiftsperioderNorge : formValues.avgiftsberegning.avgiftsperioderNorge)} />
            </Nav.Column>
          </Nav.Row>
        }
      </div>
    );
  };

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.TRYGDEAVGIFT)(state),
  formValid: formSelectors.VurderTrygdeavgiftFormValid(state),
  saerligeavgiftsgrupper: folketrygdenkodeverkSelectors.SaerligeavgiftsgrupperSelector(state),
  erTrygdeavgiftsgrunnlagNorgeUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagNorgeUgyldig(state),
  erTrygdeavgiftsgrunnlagUtlandUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagUtlandUgyldig(state),
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
    avgiftsgrunnlag: Avgiftsgrunnlag,
    avgiftsberegning: Avgiftsberegning,
  }
  erStegGyldig: boolean
}

const VurderingTrygdeavgift =
  ({
    bekreft,
    oppdater,
    tilbake,
    redigerbart,
    behandlingID,
    formValues,
    changeField,
    formValid,
    saerligeavgiftsgrupper,
    erTrygdeavgiftsgrunnlagNorgeUgyldig,
    erTrygdeavgiftsgrunnlagUtlandUgyldig,
    erStegGyldig,
  }: Props & PropsFromRedux) => {
    const [erTabellApen, setErTabellApen] = useState(new Map());
    const [erSaerligAvgiftsGruppeValgt, setErSaerligAvgiftsGruppeValgt] = useState(new Map());
    const [oppdatertAvgiftsberegning, setOppdatertAvgiftsberegning] = useState<OppdaterAvgiftsberegning>({ avgiftspliktigLønnNorge: null, avgiftspliktigLønnUtland: null });

    useEffect(() => {
      Api.Trygdeavgift.hentGrunnlag(behandlingID)
        .then(response => {
          if (response.trygdeavgiftsgrunnlagNorge && response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe !== undefined) {
            erSaerligAvgiftsGruppeValgt.set('norskVirksomhet', !!response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe);
          }
          if (response.trygdeavgiftsgrunnlagUtland && response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe !== undefined) {
            erSaerligAvgiftsGruppeValgt.set('utenlandskVirksomhet', !!response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe);
          }
          setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
          changeField('avgiftsgrunnlag', response);
        })
        .catch(Utils.logger.error);

      Api.Trygdeavgift.hentBeregning(behandlingID)
        .then(response => {
          setOppdatertAvgiftsberegning({ avgiftspliktigLønnNorge: response.avgiftspliktigLønnNorge, avgiftspliktigLønnUtland: response.avgiftspliktigLønnUtland });
          changeField('avgiftsberegning', response);
        })
        .catch(Utils.logger.error);
    }, []);

    useEffect(() => {
      oppdater();
    }, [formValid]);

    function erTrygdeavgiftsgrunnlagGyldig(trygdeavgiftsgrunnlag: AvgiftsgrunnlagInfo | null | undefined) {
      return (trygdeavgiftsgrunnlag
        && (trygdeavgiftsgrunnlag.erSkattepliktig || trygdeavgiftsgrunnlag.erSkattepliktig === false)
        && (trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift || trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift === false)
        && (trygdeavgiftsgrunnlag.særligAvgiftsgruppe === null || (!!trygdeavgiftsgrunnlag.særligAvgiftsgruppe && trygdeavgiftsgrunnlag.særligAvgiftsgruppe !== 'TRUE')));
    }

    function erAvgiftsgrunnlagGyldig(avgiftsgrunnlag: Avgiftsgrunnlag) {
      if (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold) return false;
      switch (avgiftsgrunnlag.lønnsforhold) {
        case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
          return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge);
        case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
          return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
        case MKV.Koder.loenn_forhold.DELT_LØNN:
          return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge) && !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
        default:
          return false;
      }
    }

    useEffect(() => {
      if (formValues && formValues.avgiftsgrunnlag && erAvgiftsgrunnlagGyldig(formValues.avgiftsgrunnlag)) {
        Api.Trygdeavgift.sendGrunnlag(behandlingID, {
          lønnsforhold: formValues.avgiftsgrunnlag.lønnsforhold,
          trygdeavgiftsgrunnlagNorge: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge || null,
          trygdeavgiftsgrunnlagUtland: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland || null,
        })
          .then(response => {
            changeField('avgiftsgrunnlag', response);
          })
          .catch(Utils.logger.error);
      }
    }, [formValues && formValues.avgiftsgrunnlag]);

    function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', erSærligAvgiftsgruppe)));
      changeField(
        erNorskVirksomhet ? 'avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe' : 'avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe',
        erSærligAvgiftsgruppe ? 'TRUE' : null
      );
    }

    function handleAvgiftspliktigLønnInputChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
      setOppdatertAvgiftsberegning(erNorskVirksomhet
        ? { ...oppdatertAvgiftsberegning, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) }
        : { ...oppdatertAvgiftsberegning, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) });
    }

    function handleBeregnClick(erNorskVirksomhet: boolean) {
      Api.Trygdeavgift.sendBeregning(behandlingID, oppdatertAvgiftsberegning)
        .then(response => {
          changeField('avgiftsberegning', response);
        })
        .catch(Utils.logger.error);
      setErTabellApen(new Map(erTabellApen.set(erNorskVirksomhet ? 'norskVirksomhet' : 'utenlandskVirksomhet', true)));
    }

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Trygdeavgift</Nav.typo.Undertittel>

        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
              <Skjema.Radio
                label="Norsk virksomhet"
                feltNavn="avgiftsgrunnlag.lønnsforhold"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsgrunnlag && formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              />
              <Skjema.Radio
                feltNavn="avgiftsgrunnlag.lønnsforhold"
                label="Utenlandsk virksomhet"
                value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                id={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsgrunnlag && formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              />
              <Skjema.Radio
                label="Norsk og utenlandsk virksomhet"
                feltNavn="avgiftsgrunnlag.lønnsforhold"
                value={MKV.Koder.loenn_forhold.DELT_LØNN}
                id={MKV.Koder.loenn_forhold.DELT_LØNN}
                className=""
                disabled={!redigerbart}
                defaultChecked={formValues && formValues.avgiftsgrunnlag && formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>

        {
          formValues && formValues.avgiftsgrunnlag &&
          (formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE || formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <TrygdeavgiftsgrunnlagComponent
            erVirksomhetNorsk
            formValues={formValues}
            oppdatertAvgiftsberegning={oppdatertAvgiftsberegning}
            erTabellApen={erTabellApen}
            erSaerligAvgiftsGruppeValgt={erSaerligAvgiftsGruppeValgt}
            handleBeregnClick={handleBeregnClick}
            handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
            handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
            redigerbart={redigerbart}
            erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig}
            erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig}
            saerligeavgiftsgrupper={saerligeavgiftsgrupper}
          />
        }
        {
          formValues && formValues.avgiftsgrunnlag &&
          (formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET || formValues.avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN) &&
          <TrygdeavgiftsgrunnlagComponent
            erVirksomhetNorsk={false}
            formValues={formValues}
            oppdatertAvgiftsberegning={oppdatertAvgiftsberegning}
            erTabellApen={erTabellApen}
            erSaerligAvgiftsGruppeValgt={erSaerligAvgiftsGruppeValgt}
            handleBeregnClick={handleBeregnClick}
            handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
            handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
            redigerbart={redigerbart}
            erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig}
            erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig}
            saerligeavgiftsgrupper={saerligeavgiftsgrupper}
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
            disabled={!redigerbart || !erStegGyldig}
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
  validate: lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_trygdeavgift),
})(VurderingTrygdeavgift);

export default connector(VurderingTrygdeavgiftForm);
