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
import MKV from '../../../melosyskodeverk';

import { landTekstFormat } from '../../skjema/landvelger/utils';
import { modalerOperations } from '../../../ducks/modaler';
import { soknadspanelOperations } from '../../../ducks/soknadspaneler';
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import './vurderingStart.css';


const mapStateToProps = (state: RootState) => {
  const initialSoknadsperiode = behandlingsgrunnlagSelectors.PeriodeSelector(state);
  const initialSoeknadsland = behandlingsgrunnlagSelectors.SoknadslandSelector(state);
  const initialTrygdedekning = behandlingsgrunnlagSelectors.TrygdedekningSelector(state);
  return ({
    behandlingsgrunnlagFom: behandlingsgrunnlagSelectors.PeriodeFomSelector(state),
    behandlingsgrunnlagTom: behandlingsgrunnlagSelectors.PeriodeTomSelector(state),
    soknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
    soeknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
    trygdedekning: behandlingsgrunnlagSelectors.TrygdedekningSelector(state),
    formValues: getFormValues(KV.Form.START)(state),
    initialValues: {
      fom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.fom),
      tom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.tom),
      land: initialSoeknadsland && initialSoeknadsland.toString(),
      trygdedekning: initialTrygdedekning,
    },
  });
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visOppfriskDialogOgFortsettHandle: (fortsett: () => void) => dispatch(modalerOperations.visOppfriskOgFortsett(fortsett)),
  visSoknadspanel: () => dispatch(soknadspanelOperations.visSoknadspanel()),
  oppdaterPeriode: (periode: {fom: string, tom: string}) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (soeknadsland: string[]) => dispatch((behandlingsgrunnlagOperations.oppdaterSoeknadsland(soeknadsland))),
  oppdaterTrygdedekning: (trygdedekning: string) => dispatch((behandlingsgrunnlagOperations.oppdaterTrygdedekning(trygdedekning))),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreftOgFortsett: () => void,
  redigerbart: boolean,
  oppdaterData: (avklartefakta: any) => void,
  alleLandkoder: KTObject[],
  formValues: {fom: string, tom: string, land: string, trygdedekning: string},
}

const VurderingStart =
  ({
    bekreftOgFortsett,
    redigerbart,
    formValues,
    alleLandkoder,
    visOppfriskDialogOgFortsettHandle,
    visSoknadspanel,
    oppdaterPeriode,
    oppdaterSoeknadsland,
    oppdaterTrygdedekning,
  } : Props & PropsFromRedux) => {
    const [erPeriodeGyldig, setErPeriodeGyldig] = useState(true);
    const [erObligatoriskeFelterFyltInn, setErObligatoriskeFelterFyltInn] = useState(false);

    const oppdaterLokalBehandlingsgrunnlag = () => {
      const fom = Utils.dato.formatterDatoTilISO(formValues.fom);
      const tom = Utils.dato.formatterDatoTilISO(formValues.tom)
      oppdaterPeriode({ fom: fom === 'Invalid date' ? '' : fom, tom: tom === 'Invalid date' ? '' : tom });
      oppdaterSoeknadsland([formValues.land]);
      oppdaterTrygdedekning(formValues.trygdedekning);
    };

    useEffect(() => {
      const erTomNullEllerEtterFom = !formValues.tom || Utils.dato.erGyldigPeriode(formValues.fom, formValues.tom);
      setErPeriodeGyldig(erTomNullEllerEtterFom);

      const erFelteneGyldig = !!formValues.land && !!formValues.trygdedekning && !!formValues.fom && erTomNullEllerEtterFom;
      setErObligatoriskeFelterFyltInn(erFelteneGyldig);

      oppdaterLokalBehandlingsgrunnlag();
    }, [formValues]);

    const fortsettHandle = () => {
      if (erObligatoriskeFelterFyltInn) {
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
            <Nav.Column xs="3">
              <Skjema.Input
                datoFelt
                label="Fra og med:"
                feltNavn="fom"
                bredde="fullbredde"
                disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="3">
              <Skjema.Input
                datoFelt
                label="Til og med:"
                feltNavn="tom"
                bredde="fullbredde"
                disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="5">
              <Skjema.Select label="Land" feltNavn="land" emptyFieldText="Velg" emptyFieldDisabled={!!formValues.land}>
                {alleLandkoder.map(item => (<option key={item.kode} value={item.kode}>{landTekstFormat(item)}</option>))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
          { !erPeriodeGyldig &&
          <AlertStripeFeil className="alert">
            Til og med dato kan ikke være tidligere enn fra og med dato.
          </AlertStripeFeil>}
        </Nav.Fieldset>
        <Nav.Fieldset legend="Trygdedekning">
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Select label="" feltNavn="trygdedekning" emptyFieldText="Velg" emptyFieldDisabled={!!formValues.trygdedekning}>
                {MKV.KTObjects.trygdedekninger
                  .filter((item: KTObject) =>
                    ['HELSEDEL', 'HELSEDEL_MED_SYKE_OG_FORELDREPENGER', 'PENSJONSDEL', 'HELSE_OG_PENSJONSDEL', 'HELSE_OG_PENSJONSDEL_MED_SYKE_OG_FORELDREPENGER'].includes(item.kode))
                  .map((item: KTObject) => (<option key={item.kode} value={item.kode}>{item.term}</option>))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>


        <div className="fane__knapplinje" >
          <Nav.Hovedknapp
            mini
            disabled={!erObligatoriskeFelterFyltInn}
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
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
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
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingStart);


export default connect(mapStateToProps, mapDispatchToProps)(VurderingStartForm);
