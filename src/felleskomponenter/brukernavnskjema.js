import React, { useState, useEffect } from "react";
import PT from "prop-types";
import { getFormValues, change, clearFields } from "redux-form";
import { connect } from "react-redux";
import classNames from "classnames";
import bem from "../bemUtils";

import * as Skjema from "./skjema";
import * as Api from "../services/api";
import * as Nav from "../navFrontend";

import "./brukernavnskjema.css";

export const Brukernavnskjema = ({ formValues, settFormBruker, className, onChange, onHentBruker, resetFelter }) => {
  const [brukerSpinner, setBrukerSpinner] = useState(false);
  const [brukerHentetVedOppstart, setBrukerHentetVedOppstart] = useState(false);

  const hentBruker = async (fnrdnr) => {
    setBrukerSpinner(true);

    if (fnrdnr) {
      try {
        const brukerRespons = await Api.Personer.hentPerson(fnrdnr);
        settFormBruker(brukerRespons);
      } catch (e) {
        settFormBruker("");
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

  const { bruker = {} } = formValues;
  const { sammensattNavn = "" } = bruker;

  const cls = bem("brukernavnskjema");

  return (
    <div className={classNames(cls.block, className)}>
      <Skjema.Input
        onBlur={hentBrukerMedID}
        className={cls.element("fetTekst")}
        label="Brukers f.nr eller d.nr"
        feltNavn="brukerID"
        onChange={onChange}
      />
      {sammensattNavn && (
        <div className={cls.element("navn")}>
          <Nav.Typo.Element>Brukers fulle navn</Nav.Typo.Element>
          <Nav.Typo.Normaltekst>
            {brukerSpinner && <Nav.NavFrontendSpinner />}
            {sammensattNavn}
          </Nav.Typo.Normaltekst>
        </div>
      )}
    </div>
  );
};

Brukernavnskjema.propTypes = {
  form: PT.string.isRequired,
  formValues: PT.object,
  settFormBruker: PT.func.isRequired,
  className: PT.string,
  onChange: PT.func,
  resetFelter: PT.func.isRequired,
  onHentBruker: PT.func,
};

Brukernavnskjema.defaultProps = {
  formValues: {},
  className: undefined,
  onChange: undefined,
  onHentBruker: () => {},
};

const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.form)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  settFormBruker: (brukerNavn) => dispatch(change(ownProps.form, "bruker", brukerNavn)),
  resetFelter: (felter) => dispatch(clearFields(ownProps.form, true, true, felter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Brukernavnskjema);
