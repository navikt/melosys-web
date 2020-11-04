import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import { getFormValues, reduxForm } from 'redux-form';
import { connect, ConnectedProps } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'AppTypes';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { KTObject } from '@navikt/melosys-kodeverk';

import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as Utils from '../../../utils';
import * as KV from '../../../kodeverk';

import { landTekstFormat } from '../../skjema/landvelger/utils';
import { lagAvklartfakta, lagAvklartfaktaFaktaListe } from '../../../regler/avklartefakta';
import { modalerOperations } from '../../../ducks/modaler';
import { soknadspanelOperations } from '../../../ducks/soknadspaneler';

import './vurderingStart.css';

const omEttÅr = () => {
  const idag = new Date();
  const plussEttÅr = new Date();
  plussEttÅr.setMonth(idag.getMonth() + 12);
  return plussEttÅr;
};

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.START)(state),
  initialValues: {
    fom: Utils.dato.formatterDatoTilNorsk(new Date()),
    tom: Utils.dato.formatterDatoTilNorsk(omEttÅr()),
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visOppfriskDialogOgFortsettHandle: (fortsett: () => void) => dispatch(modalerOperations.visOppfriskOgFortsett(fortsett)),
  visSoknadspanel: () => dispatch(soknadspanelOperations.visSoknadspanel()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreftOgFortsett: () => void,
  redigerbart: boolean,
  oppdaterData: (avklartefakta: any) => void,
  alleLandkoder: KTObject[],
  formValues: {fom: string, tom: string, land: string},
}

const VurderingStart =
  ({
    bekreftOgFortsett,
    redigerbart,
    formValues,
    oppdaterData,
    alleLandkoder,
    visOppfriskDialogOgFortsettHandle,
    visSoknadspanel,
  } : Props & PropsFromRedux) => {
    const [erFomForTom, setErFomForTom] = useState(true);
    const [erLandValgt, setErLandValgt] = useState(true);

    useEffect(() => {
      setErFomForTom(formValues.fom <= formValues.tom);
      oppdaterData(lagAvklartfaktaFaktaListe(KV.Koder.SOKNADSPERIODE, null, [formValues.fom, formValues.tom]));
    }, [formValues.fom, formValues.tom]);

    useEffect(() => {
      oppdaterData(lagAvklartfakta(KV.Koder.SOKNADSLAND, null, formValues.land));
    }, [formValues.land]);

    const validerLandOgPeriode = () => {
      setErLandValgt(!!formValues.land);
      return !!formValues.land && erFomForTom;
    };

    const fortsettHandle = () => {
      if (validerLandOgPeriode()) {
        const fortsett = () => {
          bekreftOgFortsett();
          visSoknadspanel();
        };
        visOppfriskDialogOgFortsettHandle(fortsett);
      }
    };

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Oppgi søknadsperiode og -land</Nav.typo.Undertittel>

        <Nav.Fieldset legend="Periode" onSubmit={fortsettHandle}>
          <Nav.Row>
            <Nav.Column xs="5">
              <Skjema.Input
                datoFelt
                label="Fra og med:"
                feltNavn="fom"
                bredde="fullbredde"
                disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="5">
              <Skjema.Input
                datoFelt
                label="Til og med:"
                feltNavn="tom"
                bredde="fullbredde"
                disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
          { !erFomForTom &&
          <AlertStripeFeil className="alert">
            Til og med dato kan ikke være tidligere enn fra og med dato.
          </AlertStripeFeil>}
        </Nav.Fieldset>
        <Nav.Fieldset legend="Land">
          <Nav.Row>
            <Nav.Column xs="5">
              <Skjema.Select label="" feltNavn="land" emptyFieldText="Velg" emptyFieldDisabled={!!formValues.land} onChange={() => setErLandValgt(true)}>
                {alleLandkoder.map(item => (<option key={item.kode} value={item.kode}>{landTekstFormat(item)}</option>))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
          { !erLandValgt &&
          <AlertStripeFeil>
            Du må velge søknadsland før du kan gå videre.
          </AlertStripeFeil>}
        </Nav.Fieldset>


        <div className="fane__knapplinje" >
          <Nav.Hovedknapp
            mini
            disabled={!redigerbart}
            className="fane__navigasjonsknapp"
            data-cy-nesteknapp="knapp_steg0"
            onClick={fortsettHandle}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };

VurderingStart.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  begrunnelser: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  formValues: PT.object,
  visOppfriskDialogOgFortsettHandle: PT.func.isRequired,
  visSoknadspanel: PT.func.isRequired,
};

VurderingStart.defaultProps = {
  formValues: {},
};

const VurderingStartForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.START,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingStart);


export default connect(mapStateToProps, mapDispatchToProps)(VurderingStartForm);
