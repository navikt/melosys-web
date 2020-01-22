import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../../../melosyskodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';
import * as MPT from '../../../../../proptypes';
import * as KV from '../../../../../kodeverk';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import Mottakerinstitusjonvelger from '../../../../../felleskomponenter/mottakerinstitusjonvelger';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { utpekingsperioderSelectors } from '../../../../../ducks/utpekingsperioder';
import { redigerbartSelectors } from '../../../../../ducks/redigerbart';

import './vurderingArtikkel13UtpekLand.css';

export const VurderingArtikkel13UtpekLand = ({
  redigerbart,
  behandlingID,
  lovvalgsland,
  lovvalgsperiode,
  tilstand: { overskrift },
  form,
  touch,
  formIsValid,
  lagreOgUtpek,
  formValues,
}) => {
  const validerForm = () => {
    touch('mottakerinstitusjon');
    return formIsValid;
  };

  const vedKlikkUtpek = async () => {
    if (!validerForm()) return;

    lagreOgUtpek({
      mottakerinstitusjoner: [formValues.mottakerinstitusjon],
    });
  };

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_UTPEKING_UTLAND,
      data: {
        begrunnelseKode: null,
        fritekst: null,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis SED A003',
      type: EKV.Koder.sedtyper.A003,
      erSed: true,
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  return (
    <Fragment>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      <Nav.typo.Undertittel>
        <Nav.typo.Element className="undertittel">Lovvalgsland:</Nav.typo.Element>
      </Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          <div>{lovvalgsland && KV.kodeTilTerm(lovvalgsland, MKV.KTObjects.landkoder)}</div>
        </Nav.Column>
      </Nav.Row>
      <Nav.typo.Undertittel>
        <Nav.typo.Element className="undertittel">Lovvalgsperiode</Nav.typo.Element>
      </Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          {fom} - {tom}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="mottakerinstitusjoner">
        <Nav.Column xs="7">
          <Mottakerinstitusjonvelger
            form={form}
            redigerbart={redigerbart}
            landkode={lovvalgsland}
            bucType={EKV.Koder.buctyper.legislation.LA_BUC_02}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikkUtpek} disabled={!redigerbart} type="hoved">SEND PÅSTAND</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13UtpekLand.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsland: PT.string.isRequired,
  lovvalgsperiode: MPT.Periode,
  form: PT.string.isRequired,
  formValues: PT.object,
  formIsValid: PT.bool.isRequired,
  touch: PT.func.isRequired,
  lagreOgUtpek: PT.func.isRequired,
};

VurderingArtikkel13UtpekLand.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsland: utpekingsperioderSelectors.LovvalgslandSelector(state),
  lovvalgsperiode: utpekingsperioderSelectors.UtpekingsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_UTPEKLAND)(state),
  initialValues: {
    mottakerinstitusjon: '',
    kreverMottakerinstitusjon: false,
  },
});

const VurderingArtikkel13UtpekLand_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_UTPEKLAND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel13_utpek),
})(VurderingArtikkel13UtpekLand);

export default connect(mapStateToProps)(VurderingArtikkel13UtpekLand_form);
