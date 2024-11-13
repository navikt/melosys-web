import PT from "prop-types";
import { reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";

import BrukerNavnSkjema from "../../../felleskomponenter/brukerNavnSkjema";
import { journalforingSelectors } from "../../../ducks/journalforing";

import Komponent from "./komponent";
import Fotknapper from "./fotknapper";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import journalforingsedSchema from "./journalforingsedSchema";

const JournalforingSED = ({
  avsenderID,
  avsenderNavn,
  sakstype,
  behandlingstema,
  form,
  submitSpinner,
  avbrytJournalforing,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit}>
    <Komponent
      ikon={Ikoner.AccountCircle}
      tittel="Informasjon om bruker"
      innhold={
        <Nav.Row>
          <Nav.Column xs="6">
            <BrukerNavnSkjema form={form} />
          </Nav.Column>
        </Nav.Row>
      }
    />

    <Komponent
      ikon={Ikoner.Globe}
      tittel="Informasjon om avsender"
      innhold={
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Typo.Element>Avsender ID</Nav.Typo.Element>
            <Nav.BodyLong size="small">{avsenderID}</Nav.BodyLong>
            <Nav.Typo.Element>Avsenders navn</Nav.Typo.Element>
            <Nav.BodyLong size="small">{avsenderNavn}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
      }
    />
    <Komponent
      ikon={Ikoner.ParagraphTwoColumns}
      tittel="Saksinformasjon"
      innhold={
        <Nav.Row>
          <Nav.Column xs="5">
            <Nav.Typo.Element>Sakstype</Nav.Typo.Element>
            <Nav.BodyLong size="small">{sakstype.term}</Nav.BodyLong>
          </Nav.Column>
          <Nav.Column xs="7">
            <Nav.Typo.Element>Behandlingstema</Nav.Typo.Element>
            <Nav.BodyLong size="small">{behandlingstema.term}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
      }
    />

    <Fotknapper avbrytJournalforing={avbrytJournalforing} spinner={submitSpinner} />
  </form>
);

JournalforingSED.propTypes = {
  avsenderNavn: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  sakstype: MPT.Kodeverk.isRequired,
  behandlingstema: MPT.Kodeverk.isRequired,
  form: PT.string.isRequired,
  submitSpinner: PT.bool.isRequired,
  submitJournalforing: PT.func.isRequired,
  avbrytJournalforing: PT.func.isRequired,
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
