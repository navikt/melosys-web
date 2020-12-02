import React, { ChangeEvent, Fragment } from 'react';
import { arrayPush, arrayRemove, change, getFormValues, reduxForm } from 'redux-form';
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { Medlemskapsperiode, OppdaterMedlemskapsperiode } from 'Domene';
import { v4 as uuidv4 } from 'uuid';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Skjema from '../../../../felleskomponenter/skjema';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { termFraKTObject } from '../../../../kodeverk';

import './vurderingPerioder.css';
import * as Mui from '../../../ui';
import * as Ikoner from '../../../../resources/images';
import * as Api from '../../../../services/api';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';


interface PeriodeElementProps {
  index: number,
  redigerbart: boolean,
  trygdedekninger: KTObject[],
  formValues: { medlemskapsperioder: (Medlemskapsperiode & { ny: boolean})[]},
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
    formValues,
    handleFomChange,
    handleTomChange,
    handleTrygdedekningChange,
    handleResultatChange,
    handleSlett,
  }: PeriodeElementProps) => {
  const resultater = [{kode: 'INNVILGET',term: 'Innvilget'}, {kode: 'DELVIS_INNVILGET',term: 'Delvis innvilget'}, {kode: 'AVSLAATT',term: 'Avslått'}];

  return (
    <Fragment>
      <Nav.Fieldset legend="Periode" className="understrek">
        <Nav.Row>
          <Nav.Column xs={"2"}>
            <Skjema.Input
              datoFelt
              label="Fra og med:"
              feltNavn={`medlemskapsperioder[${index}].fomDato`}
              bredde="fullbredde"
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleFomChange(event.target.value, index)}
              disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs={"2"}>
            <Skjema.Input
              datoFelt
              label="Til og med:"
              feltNavn={`medlemskapsperioder[${index}].tomDato`}
              bredde="fullbredde"
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleTomChange(event.target.value, index)}
              disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs={"4"}>
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
          <Nav.Column xs={"4"}>
            <Skjema.Select
              label="Resultat"
              feltNavn={`medlemskapsperioder[${index}].innvilgelsesResultat`}
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.medlemskapsperioder[index].innvilgelsesResultat}
              onChange={event => handleResultatChange(event.target.value, index)}
            >
              {resultater.map((item: KTObject) => (<option key={item.kode} value={item.kode}>{item.term}</option>))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
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
};


const mapStateToProps = (state: RootState) => ({
  trygdedekning: behandlingsgrunnlagSelectors.TrygdedekningSelector(state),
  formValues: getFormValues(KV.Form.PERIODER)(state),
  initialValues: {
    medlemskapsperioder: transformInitialMedlemskapsperioder(state),
  },
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

function transformInitialMedlemskapsperioder(state: RootState){
  const medlemskapsperioder = medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state);
  return medlemskapsperioder && medlemskapsperioder
    .map(medlemskapsperiode => ({...medlemskapsperiode,
      tomDato : Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
      fomDato : Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato)
    }));
}

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  removeField: (index: number) => dispatch(arrayRemove(KV.Form.PERIODER, 'medlemskapsperioder', index)),
  changeField: (index: number, data: Medlemskapsperiode & { ny: boolean}) => dispatch(change(KV.Form.PERIODER,`medlemskapsperioder[${index}]`, data)),
  pushField: (data: { id: string, ny: boolean}) => dispatch(arrayPush(KV.Form.PERIODER, 'medlemskapsperioder', data)),
  hentMedlemskapsperioder: (behandlingID: number) => dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  formValues: { medlemskapsperioder: (Medlemskapsperiode & { ny: boolean})[]},
}

type VurderingPerioderProps = Props & PropsFromRedux;


const VurderingPerioder =
  ({
    formValues,
    removeField,
    changeField,
    pushField,
    bekreft,
    tilbake,
    behandlingID,
    hentMedlemskapsperioder,
    trygdedekning,
    ...props
  }: VurderingPerioderProps) => {
    const hjelpetekst = 'Perioder er foreslått på bakgrunn av periode og dekning det er søkt for, og tidspunkt søknaden ble mottatt. Du har mulighet til å gjøre endringer.';

    const handleFomChange = (value: string, index: number) => {
      handleChange(index, value, null, null, null);
    };
    const handleTomChange =  (value: string, index: number) => {
      handleChange(index, null, value ? value : 'null', null, null);
    };
    const handleTrygdedekningChange =  (value: string, index: number) => {
      handleChange(index, null, null, value, null);
    };
    const handleResultatChange =  (value: string, index: number) => {
      handleChange(index, null, null, null, value);
    };

    const handleChange = (index: number, fomDato: string | null, tomDato: string | null, trygdedekning: string | null, resultat: string | null) => {
      const nyFomDato = fomDato ? Utils.dato.formatterDatoTilISO(fomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].fomDato);
      let nyTomDato = tomDato ? Utils.dato.formatterDatoTilISO(tomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].tomDato);
      const nyTrygdedekning = trygdedekning ? trygdedekning : formValues.medlemskapsperioder[index].trygdedekning;
      const nyInnvilgelsesResultat = resultat ? resultat : formValues.medlemskapsperioder[index].innvilgelsesResultat;

      if (!(nyFomDato !== 'Invalid date' && nyTrygdedekning && nyInnvilgelsesResultat)) {
        return
      }

      const oppdatertMedlemskapsperiode =  {
        fomDato: nyFomDato,
        tomDato: nyTomDato !== 'Invalid date' ? nyTomDato : null,
        trygdedekning: nyTrygdedekning,
        innvilgelsesResultat: nyInnvilgelsesResultat,
      };

      if (formValues.medlemskapsperioder[index].ny) {
        opprettMedlemskapsperiode(oppdatertMedlemskapsperiode, index);
      }
      else {
        oppdaterMedlemskapsperiode(oppdatertMedlemskapsperiode, formValues.medlemskapsperioder[index].id);
      }
    };

    const oppdaterMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, medlemskapsperiodeID: number) => {
      Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsperiodeID, oppdatertMedlemskapsperiode)
        .catch(Utils.logger.error)
    };

    const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number) => {
      Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, oppdatertMedlemskapsperiode)
        .then(response => {
          changeField(index, {...response,
            ny: false,
            tomDato : Utils.dato.formatterDatoTilNorsk(response.tomDato),
            fomDato : Utils.dato.formatterDatoTilNorsk(response.fomDato)
          });
        })
        .catch(Utils.logger.error);
    };

    const handleSlett = (index: number) => {
      const id = formValues.medlemskapsperioder[index].id;
      Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, id)
        .then(()  => {
          removeField(index);
        })
        .catch(Utils.logger.error)
    };

    const handleLeggTil = () => {
      const nyMedlemskapsperiode = {
        id: uuidv4(),
        ny: true,
      };
      pushField(nyMedlemskapsperiode);
    };

    const handleBekreft = () => {
      hentMedlemskapsperioder(behandlingID);
      bekreft();
    };


    return(
      <div className="perioder">
        <Nav.typo.Undertittel className="undertittel">
          Kontroller foreslåtte medlemskapsperioder
          <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>{hjelpetekst}</Nav.Hjelpetekst>
        </Nav.typo.Undertittel>

        <div>
          <Nav.typo.Element className="info_element">Søknad mottatt: </Nav.typo.Element>
          <Nav.typo.Normaltekst className="info_element">{'03.11.2020'}</Nav.typo.Normaltekst>
        </div>
        <div>
          <Nav.typo.Element className="info_element">Trygdedekning fra søknad: </Nav.typo.Element>
          <Nav.typo.Normaltekst className="info_element">{termFraKTObject(MKV.KTObjects.trygdedekninger, trygdedekning)}</Nav.typo.Normaltekst>
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
            {...props} />
        )}

        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={handleLeggTil}
            ikon={Ikoner.Add}
          >
            Legg til ny periode
          </Mui.Knappelenke>
        </div>

        <div className="fane__knapplinje" >
          <Nav.Knapp
            mini
            disabled={!props.redigerbart}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!props.redigerbart}
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
