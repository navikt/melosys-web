import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { arrayPush, arrayRemove, change, getFormValues, reduxForm } from 'redux-form';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { KTObject } from '@navikt/melosys-kodeverk';
import { RootState } from 'AppTypes';
import { Medlemskapsperiode, OppdaterMedlemskapsperiode } from 'Domene';
import { v4 as uuidv4 } from 'uuid';

import MKV from '../../../../melosyskodeverk';
import * as Api from '../../../../services/api';
import * as Ikoner from '../../../../resources/images';
import * as KV from '../../../../kodeverk';
import * as Mui from '../../../ui';
import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../../felleskomponenter/skjema';
import * as Utils from '../../../../utils';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';

import './vurderingPerioder.css';


interface PeriodeElementProps {
  index: number,
  redigerbart: boolean,
  trygdedekninger: KTObject[],
  innvilgelsesResultater: KTObject[],
  formValues: { medlemskapsperioder: (Medlemskapsperiode & { ny: boolean, feil: string | undefined })[]},
  handleFomChange: (value: string, index: number) => void;
  handleTomChange: (value: string, index: number) => void;
  handleTrygdedekningChange: (value: string, index: number) => void;
  handleResultatChange: (value: string, index: number) => void;
  handleSlett: (index: number) => void;
}
const PeriodeElement =
  ({
    index,
    redigerbart,
    trygdedekninger,
    innvilgelsesResultater,
    formValues,
    handleFomChange,
    handleTomChange,
    handleTrygdedekningChange,
    handleResultatChange,
    handleSlett,
  }: PeriodeElementProps) => (
    <Fragment>
      <Nav.Fieldset legend="Periode" className="understrek">
        <Nav.Row>
          <Nav.Column xs="2">
            <Skjema.Input
              datoFelt
              label="Fra og med:"
              feltNavn={`medlemskapsperioder[${index}].fomDato`}
              bredde="fullbredde"
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleFomChange(event.target.value, index)}
              disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="2">
            <Skjema.Input
              datoFelt
              label="Til og med:"
              feltNavn={`medlemskapsperioder[${index}].tomDato`}
              bredde="fullbredde"
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleTomChange(event.target.value, index)}
              disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Select
              label="Trygdedekning"
              feltNavn={`medlemskapsperioder[${index}].trygdedekning`}
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.medlemskapsperioder[index].trygdedekning}
              onChange={event => handleTrygdedekningChange(event.target.value, index)}
            >
              {trygdedekninger.map((item: KTObject) => (<option key={item.kode} value={item.kode}>{item.term}</option>))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Select
              label="Resultat"
              feltNavn={`medlemskapsperioder[${index}].innvilgelsesResultat`}
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.medlemskapsperioder[index].innvilgelsesResultat}
              onChange={event => handleResultatChange(event.target.value, index)}
            >
              {innvilgelsesResultater.map((item: KTObject) => (<option key={item.kode} value={item.kode}>{item.term}</option>))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        {
          formValues.medlemskapsperioder[index].feil &&
          <Nav.AlertStripe type="feil" style={{ marginBottom: '1rem' }}>{formValues.medlemskapsperioder[index].feil}</Nav.AlertStripe>
        }
        {
          redigerbart && formValues.medlemskapsperioder.length > 1 &&
          <Nav.Lenker className="slettKnapp" href="#" onClick={() => handleSlett(index)}>
            <Ikoner.Bin2 />
            <span>Slett periode</span>
          </Nav.Lenker>
        }
      </Nav.Fieldset>
    </Fragment>
  );


function transformInitialMedlemskapsperioder(state: RootState) {
  const medlemskapsperioder = medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state);
  return medlemskapsperioder && medlemskapsperioder
    .map(medlemskapsperiode => ({
      ...medlemskapsperiode,
      tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
      fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
    }));
}

const mapStateToProps = (state: RootState) => ({
  mottaksdato: behandlingsgrunnlagSelectors.MottaksdatoSelector(state),
  valgtTrygdedekning: behandlingsgrunnlagSelectors.TrygdedekningSelector(state),
  formValues: getFormValues(KV.Form.PERIODER)(state),
  initialValues: {
    medlemskapsperioder: transformInitialMedlemskapsperioder(state),
  },
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  removeField: (index: number) => dispatch(arrayRemove(KV.Form.PERIODER, 'medlemskapsperioder', index)),
  changeField: (index: number, data: Medlemskapsperiode & { ny: boolean, feil: string | undefined }) => dispatch(change(KV.Form.PERIODER, `medlemskapsperioder[${index}]`, data)),
  changeFieldFeil: (index: number, feil: string | undefined) => dispatch(change(KV.Form.PERIODER, `medlemskapsperioder[${index}].feil`, feil)),
  pushField: (data: { id: string, ny: boolean, fomDato: string | null }) => dispatch(arrayPush(KV.Form.PERIODER, 'medlemskapsperioder', data)),
  hentMedlemskapsperioder: (behandlingID: number) => dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  formValues: { medlemskapsperioder: (Medlemskapsperiode & { ny: boolean, feil: string | undefined })[]},
}

type VurderingPerioderProps = Props & PropsFromRedux;

const VurderingPerioder =
  ({
    formValues,
    removeField,
    changeField,
    changeFieldFeil,
    pushField,
    bekreft,
    tilbake,
    behandlingID,
    hentMedlemskapsperioder,
    valgtTrygdedekning,
    mottaksdato,
    ...props
  }: VurderingPerioderProps) => {
    const [erAllePerioderAvslått, setErAllePerioderAvslått] = useState(false);
    const [erFortsattDisabled, setErFortsattDisabled] = useState(false);
    const hjelpetekst = 'Perioder er foreslått på bakgrunn av periode og dekning det er søkt for, og tidspunkt søknaden ble mottatt. Du har mulighet til å gjøre endringer.';

    const erMedlemskapsperiodeFullført = (innvilgelsesResultat: string, trygdedekning: string, fomDato: string) => (
      innvilgelsesResultat && trygdedekning && fomDato && fomDato !== 'Invalid date'
    );

    useEffect(() => {
      const erAllePerioderAnnetEnnAvslatt = formValues && formValues.medlemskapsperioder.some(medlemskapsperiode => medlemskapsperiode.innvilgelsesResultat !== KV.Koder.AVSLAATT);
      setErAllePerioderAvslått(!erAllePerioderAnnetEnnAvslatt);
      const erNoenPerioderUfullført = formValues && formValues.medlemskapsperioder.some(medlemskapsperiode =>
        medlemskapsperiode.ny || !erMedlemskapsperiodeFullført(medlemskapsperiode.innvilgelsesResultat, medlemskapsperiode.trygdedekning, medlemskapsperiode.fomDato));
      const erFeilAktivPaPerioder = formValues && formValues.medlemskapsperioder.some(medlemskapsperiode => !!medlemskapsperiode.feil);
      setErFortsattDisabled(erNoenPerioderUfullført || erFeilAktivPaPerioder || !erAllePerioderAnnetEnnAvslatt);
    }, [formValues]);

    const oppdaterMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number, medlemskapsperiodeID: number) => {
      Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsperiodeID, oppdatertMedlemskapsperiode)
        .then(() => {
          changeFieldFeil(index, undefined);
        })
        .catch(error => {
          Utils.logger.error(error);
          changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
        });
    };

    const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number) => {
      Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, oppdatertMedlemskapsperiode)
        .then(response => {
          changeField(index, {
            ...response,
            ny: false,
            tomDato: Utils.dato.formatterDatoTilNorsk(response.tomDato),
            fomDato: Utils.dato.formatterDatoTilNorsk(response.fomDato),
            feil: undefined,
          });
        })
        .catch(error => {
          Utils.logger.error(error);
          changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
        });
    };

    const handleChange = (index: number, fomDato: string | null, tomDato: string | null, trygdedekning: string | null, resultat: string | null) => {
      const nyFomDato = fomDato ? Utils.dato.formatterDatoTilISO(fomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].fomDato);
      const nyTomDato = tomDato ? Utils.dato.formatterDatoTilISO(tomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].tomDato);
      const nyTrygdedekning = trygdedekning || formValues.medlemskapsperioder[index].trygdedekning;
      const nyInnvilgelsesResultat = resultat || formValues.medlemskapsperioder[index].innvilgelsesResultat;

      if (!(erMedlemskapsperiodeFullført(nyInnvilgelsesResultat, nyTrygdedekning, nyFomDato))) {
        return;
      }

      const oppdatertMedlemskapsperiode = {
        fomDato: nyFomDato,
        tomDato: nyTomDato !== 'Invalid date' ? nyTomDato : null,
        trygdedekning: nyTrygdedekning,
        innvilgelsesResultat: nyInnvilgelsesResultat,
      };

      if (formValues.medlemskapsperioder[index].ny) {
        opprettMedlemskapsperiode(oppdatertMedlemskapsperiode, index);
      } else {
        oppdaterMedlemskapsperiode(oppdatertMedlemskapsperiode, index, formValues.medlemskapsperioder[index].id);
      }
    };

    const handleFomChange = (value: string, index: number) => {
      handleChange(index, value, null, null, null);
    };

    const handleTomChange = (value: string, index: number) => {
      handleChange(index, null, value || 'null', null, null);
    };

    const handleTrygdedekningChange = (value: string, index: number) => {
      handleChange(index, null, null, value, null);
    };

    const handleResultatChange = (value: string, index: number) => {
      handleChange(index, null, null, null, value);
    };

    const handleSlett = (index: number) => {
      if (formValues.medlemskapsperioder[index].ny) {
        removeField(index);
        return;
      }

      Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, formValues.medlemskapsperioder[index].id)
        .then(() => {
          removeField(index);
        })
        .catch(error => {
          Utils.logger.error(error);
          changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
        });
    };

    const handleLeggTil = () => {
      const sistePeriodeTomDato = formValues.medlemskapsperioder.length > 0 && formValues.medlemskapsperioder[formValues.medlemskapsperioder.length - 1].tomDato;
      const nyMedlemskapsperiode = {
        id: uuidv4(),
        ny: true,
        fomDato: sistePeriodeTomDato ? Utils.dato.plussEnDag(sistePeriodeTomDato) : null,
      };
      pushField(nyMedlemskapsperiode);
    };

    const handleBekreft = () => {
      hentMedlemskapsperioder(behandlingID);
      bekreft();
    };


    return (
      <div className="perioder">
        <Nav.typo.Undertittel className="undertittel">
          Kontroller foreslåtte medlemskapsperioder
          <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>{hjelpetekst}</Nav.Hjelpetekst>
        </Nav.typo.Undertittel>

        <div>
          <Nav.typo.Element className="info_element">Søknad mottatt: </Nav.typo.Element>
          <Nav.typo.Normaltekst className="info_element">{Utils.dato.formatterDatoTilNorsk(mottaksdato)}</Nav.typo.Normaltekst>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Nav.typo.Element className="info_element">Trygdedekning fra søknad: </Nav.typo.Element>
          <Nav.typo.Normaltekst className="info_element">{KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, valgtTrygdedekning)}</Nav.typo.Normaltekst>
        </div>

        {
          formValues && formValues.medlemskapsperioder && formValues.medlemskapsperioder.map((medlemskapsperiode: Medlemskapsperiode & { ny: boolean}, index: number) =>
            <PeriodeElement
              key={medlemskapsperiode.id}
              index={index}
              formValues={formValues}
              handleFomChange={handleFomChange}
              handleTomChange={handleTomChange}
              handleTrygdedekningChange={handleTrygdedekningChange}
              handleResultatChange={handleResultatChange}
              handleSlett={handleSlett}
              {...props} />)
        }

        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={handleLeggTil}
            ikon={Ikoner.Add}
          >
            Legg til ny periode
          </Mui.Knappelenke>
        </div>

        {
          erAllePerioderAvslått &&
          <Nav.AlertStripe type="feil">Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.</Nav.AlertStripe>
        }

        <div className="fane__knapplinje" >
          <Nav.Knapp
            mini
            disabled={!props.redigerbart}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!(props.redigerbart) || erFortsattDisabled}
            className="fane__navigasjonsknapp"
            onClick={handleBekreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };

const VurderingPerioderForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.PERIODER,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingPerioder);

export default connector(VurderingPerioderForm);
