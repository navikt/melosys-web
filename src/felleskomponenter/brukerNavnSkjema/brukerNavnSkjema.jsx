import { useState, useEffect } from "react";
import PT from "prop-types";
import { getFormValues, change, clearFields } from "redux-form";
import { connect } from "react-redux";
import classNames from "classnames";
import bem from "../../bemUtils";
import { hentSammensattNavn } from "../../graphql/navn";

import * as Skjema from "../skjema";
import * as Nav from "../../navFrontend";

import "./brukerNavnSkjema.css";

export const BrukerNavnSkjema = ({
  formValues,
  settFormBrukerNavn,
  className,
  onChange,
  onHentBruker,
  resetFelter,
}) => {
  const [brukerSpinner, setBrukerSpinner] = useState(false);
  const [brukerHentetVedOppstart, setBrukerHentetVedOppstart] = useState(false);

  const hentBruker = async (fnrdnr) => {
    setBrukerSpinner(true);

    if (fnrdnr) {
      try {
        const navn = await hentSammensattNavn(fnrdnr);
        settFormBrukerNavn(navn);
      } catch (e) {
        settFormBrukerNavn("");
      }
    }

    onHentBruker(fnrdnr);
    setBrukerSpinner(false);
  };

  const hentBrukerMedID = () => {
    hentBruker(formValues.brukerID);
  };

  useEffect(() => {
    if (formValues.brukerID && !brukerHentetVedOppstart) {
      hentBrukerMedID();
      setBrukerHentetVedOppstart(true);
    } else if (!formValues.brukerID) {
      resetFelter(["bruker"]);
    }
  }, [formValues.brukerID]);

  const sammensattNavn = formValues.brukerNavn || "";

  const cls = bem("brukerNavnSkjema");

  return (
    <div className={classNames(cls.block, className)}>
      <Skjema.Input
        onBlur={hentBrukerMedID}
        className={cls.element("fetTekst")}
        label="Brukers f.nr. eller d-nr."
        feltNavn="brukerID"
        onChange={onChange}
      />
      {sammensattNavn && (
        <div className={cls.element("navn")}>
          <Nav.Typo.Element>Brukers fulle navn</Nav.Typo.Element>
          <Nav.BodyLong size="small">
            {brukerSpinner && <Nav.Loader />}
            {sammensattNavn}
          </Nav.BodyLong>
        </div>
      )}
    </div>
  );
};

BrukerNavnSkjema.propTypes = {
  form: PT.string.isRequired,
  formValues: PT.object,
  settFormBrukerNavn: PT.func.isRequired,
  className: PT.string,
  onChange: PT.func,
  resetFelter: PT.func.isRequired,
  onHentBruker: PT.func,
};

BrukerNavnSkjema.defaultProps = {
  formValues: {},
  className: undefined,
  onChange: undefined,
  onHentBruker: () => {},
};

const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.form)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  settFormBrukerNavn: (brukerNavn) => dispatch(change(ownProps.form, "brukerNavn", brukerNavn)),
  resetFelter: (felter) => dispatch(clearFields(ownProps.form, true, true, felter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BrukerNavnSkjema);
