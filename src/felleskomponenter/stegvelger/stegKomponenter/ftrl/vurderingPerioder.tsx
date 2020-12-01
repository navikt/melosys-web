import React, { ChangeEvent, Fragment, useEffect } from 'react';
import { change, formValues, getFormValues, reduxForm, unregisterField } from 'redux-form';
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { Medlemskapsperiode, OppdaterMedlemskapsperiode } from 'Domene';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Skjema from '../../../../felleskomponenter/skjema';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { termFraKTObject } from '../../../../kodeverk';

import './vurderingPerioder.css';
import * as Mui from '../../../ui';
import * as Ikoner from '../../../../resources/images';
import * as Api from '../../../../services/api';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';


interface PeriodeElementProps {
  index: number,
  handleFomChange: (value: string, index: number) => void;
  handleTomChange: (value: string, index: number) => void;
  handleTrygdedekningChange: (value: string, index: number) => void;
  handleResultatChange: (value: string, index: number) => void;
  slettMedlemskapsperiode: (index: number) => void;
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
    slettMedlemskapsperiode,
  }: PeriodeElementProps & VurderingPerioderProps) => {
  const resultater = [{kode: 'INNVILGET',term: 'Innvilget'}, {kode: 'DELVIS_INNVILGET',term: 'Delvis innvilget'}, {kode: 'AVSLAATT',term: 'Avslått'}];

  console.log(formValues.medlemskapsperioder[index].ny)
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
          redigerbart &&
          <Nav.Lenker className="slettKnapp" href="#" onClick={() => slettMedlemskapsperiode(index)}>
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
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;


interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  oppdaterData: (avklartefakta: any) => void,
  alleLandkoder: KTObject[],
  formValues: { medlemskapsperioder: (Medlemskapsperiode & { ny: boolean})[]},
}

type VurderingPerioderProps = Props & PropsFromRedux;


const VurderingPerioder =
  ({formValues, ...props} : VurderingPerioderProps) => {
  const hjelpetekst = 'Perioder er foreslått på bakgrunn av periode og dekning det er søkt for, og tidspunkt søknaden ble mottatt. Du har mulighet til å gjøre endringer.';

  const handleFomChange = (value: string, index: number) => {
    handleChange(index, value, null, value, null);
  };
  const handleTomChange =  (value: string, index: number) => {
    handleChange(index, null, value, null, null);
  };
  const handleTrygdedekningChange =  (value: string, index: number) => {
    handleChange(index, null, null, value, null);
  };
  const handleResultatChange =  (value: string, index: number) => {
    handleChange(index, null, null, null, value);
  };

  const handleChange = (index: number, fomDato: string | null, tomDato: string | null, trygdedekning: string | null, resultat: string | null) => {
    const oppdatertMedlemskapsperiode =  {
      fomDato: fomDato ? Utils.dato.formatterDatoTilISO(fomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].fomDato),
      tomDato: tomDato ? Utils.dato.formatterDatoTilISO(tomDato) : Utils.dato.formatterDatoTilISO(formValues.medlemskapsperioder[index].tomDato),
      trygdedekning: trygdedekning ? trygdedekning : formValues.medlemskapsperioder[index].trygdedekning,
      innvilgelsesResultat: resultat ? resultat : formValues.medlemskapsperioder[index].innvilgelsesResultat,
    };

    if (formValues.medlemskapsperioder[index].ny) {
      opprettMedlemskapsperiode(oppdatertMedlemskapsperiode);
    }
    else {
      oppdaterMedlemskapsperiode(oppdatertMedlemskapsperiode, formValues.medlemskapsperioder[index].id);
    }
  };

  const oppdaterMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, medlemskapsperiodeID: number) => {
    Api.Medlemskapsperioder.putMedlemskapsperioder(props.behandlingID, medlemskapsperiodeID, oppdatertMedlemskapsperiode)
       .then(response => {
         console.log(response)
       })
       .catch(Utils.logger.error)
  };

  const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode) => {
    Api.Medlemskapsperioder.postMedlemskapsperioder(props.behandlingID, oppdatertMedlemskapsperiode)
       .then(response => {
         console.log(response)
       })
       .catch(Utils.logger.error);
  };

  const slettMedlemskapsperiode = (index: number) => {
    const id = formValues.medlemskapsperioder[index].id;
    Api.Medlemskapsperioder.deleteMedlemskapsperioder(props.behandlingID, id)
       .then(()  => {
         console.log(formValues.medlemskapsperioder.filter(medlemskapsperiode => medlemskapsperiode.id !== id))
         formValues.medlemskapsperioder = formValues.medlemskapsperioder.filter(medlemskapsperiode => medlemskapsperiode.id !== id);
       })
       .catch(Utils.logger.error)
  };

  const handleSlett = () => {

  };

  const handleLeggTil = () => {

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
        <Nav.typo.Normaltekst className="info_element">{termFraKTObject(MKV.KTObjects.trygdedekninger, props.trygdedekning)}</Nav.typo.Normaltekst>
      </div>

      {formValues && formValues.medlemskapsperioder.map((medlemskapsperiode, index) =>
        <PeriodeElement
          key={medlemskapsperiode.id}
          index={index}
          formValues={formValues}
          handleFomChange={handleFomChange}
          handleTomChange={handleTomChange}
          handleTrygdedekningChange={handleTrygdedekningChange}
          handleResultatChange={handleResultatChange}
          slettMedlemskapsperiode={slettMedlemskapsperiode}
          {...props} />
      )}

      { formValues && formValues.medlemskapsperioder && formValues.medlemskapsperioder.length > 0 &&
        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={() => console.log("plus")}
            ikon={Ikoner.Add}
          >
            Legg til ny periode
          </Mui.Knappelenke>
        </div>
      }

      <div className="fane__knapplinje" >
        <Nav.Knapp
          mini
          disabled={!props.redigerbart}
          className="fane__navigasjonsknapp"
          onClick={props.tilbake}>Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!props.redigerbart}
          className="fane__navigasjonsknapp"
          onClick={props.bekreft}>Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingPerioderForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.PERIODER,
  // enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingPerioder);

export default connector(VurderingPerioderForm);
