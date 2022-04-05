import React from "react";
import { formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { RootState } from "AppTypes";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";

type DatavisningProps = {
  label: string;
  verdi: string;
};

type DatavisningWrapperProps = {
  formNavn: string;
  feltNavn: string;
  label: string;
};

const Datavisning = ({ label, verdi }: DatavisningProps) => {
  return (
    <div className="datavisning">
      <Nav.Typo.Element>
        {label}: {verdi}
      </Nav.Typo.Element>
    </div>
  );
};

const DatavisningWrapper = ({ formNavn, feltNavn }: DatavisningWrapperProps) => {
  const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(formNavn);

  const mapStateToProps = (state: RootState) => ({
    avsendernavn: journalforingFormValueSelector(state, feltNavn),
  });
  return connect(mapStateToProps)(Datavisning);
};

export default DatavisningWrapper;
