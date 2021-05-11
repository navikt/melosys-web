import React from "react";
import PT from "prop-types";
import { reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";

import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";
import * as Mui from "../../../felleskomponenter/ui";

import Brukernavnskjema from "../../../felleskomponenter/brukernavnskjema";
import Fotknapper from "./fotknapper";

import { journalforingSelectors } from "../../../ducks/journalforing";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import journalforingsedSchema from "./journalforingsedSchema";

import "./journalforingsed.css";

const JournalforingSED = ({
  avsenderID,
  avsenderNavn,
  sakstype,
  behandlingstema,
  form,
  kanSubmittes,
  avbrytJournalforing,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit} className="journalforingSed">
    <Mui.Undertittel
      tekst="Informasjon om bruker"
      ikon={Ikoner.AccountCircle}
      className="undertittel oversteUndertittel"
      understrek
    />
    <Nav.Row>
      <Nav.Column xs="6">
        <Brukernavnskjema form={form} />
      </Nav.Column>
    </Nav.Row>
    <Mui.Undertittel tekst="Informasjon om avsender" ikon={Ikoner.Globe} className="undertittel" understrek />
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Typo.Element>Avsender ID</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{avsenderID}</Nav.Typo.Normaltekst>
        <Nav.Typo.Element>Avsenders navn</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{avsenderNavn}</Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    <Mui.Undertittel tekst="Saksinformasjon" ikon={Ikoner.ParagraphTwoColumns} className="undertittel" understrek />
    <Nav.Row>
      <Nav.Column xs="5">
        <Nav.Typo.Element>Sakstype</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{sakstype.term}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="7">
        <Nav.Typo.Element>Behandlingstema</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{behandlingstema.term}</Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    <Fotknapper kanSubmittes={kanSubmittes} avbrytJournalforing={avbrytJournalforing} />
  </form>
);

JournalforingSED.propTypes = {
  avsenderNavn: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  sakstype: MPT.Kodeverk.isRequired,
  behandlingstema: MPT.Kodeverk.isRequired,
  form: PT.string.isRequired,
  submitJournalforing: PT.func.isRequired,
  avbrytJournalforing: PT.func.isRequired,
  kanSubmittes: PT.bool.isRequired,
  handleSubmit: PT.func.isRequired,
};

const form = {
  form: KV.Form.JOURNALFORING_SED,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(journalforingsedSchema),
};

const mapStateToProps = (state) => ({
  onSubmit: (values, dispatch, props) => props.submitJournalforing(),
  formValues: getFormValues(KV.Form.JOURNALFORING_SED)(state),
  initialValues: {
    submittable: true,
    brukerID: journalforingSelectors.BrukerIDSelector(state),
  },
});

export default connect(mapStateToProps)(reduxForm(form)(JournalforingSED));
