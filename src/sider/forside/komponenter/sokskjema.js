import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, change } from "redux-form";
import { withRouter } from "react-router-dom";
import PT from "prop-types";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";

import "./sokskjema.css";
import { EnkelFellesInputFnrDnrOrgnrSaksnr } from "../../../felleskomponenter/enkelFellesInputFnrDnrOrgnrSaksnr";

class SokSkjema extends Component {
  UNSAFE_componentWillMount() {
    const { fnr } = this.props.match.params;
    this.oppdaterLokalSokState(fnr);
  }

  vedSokSubmit = (form) => {
    const { lagreSokString, handleSubmit, history } = this.props;
    const { sokStreng } = this.state;

    lagreSokString(sokStreng);
    handleSubmit(form);

    sessionStorage.setItem("sokefrase", sokStreng);
    history.push("/sok");
  };

  vedEndretSokFelt = (sokStreng) => {
    this.setState({ sokStreng });
  };

  oppdaterLokalSokState = (sokStreng) => {
    this.setState({ sokStreng });
  };

  render() {
    return (
      <form className="sokeskjema" onSubmit={this.vedSokSubmit}>
        <Nav.Typo.Normaltekst className="sok__tekst">Søk sak:</Nav.Typo.Normaltekst>
        <EnkelFellesInputFnrDnrOrgnrSaksnr
          id="id-sokeskjema"
          label=""
          className="sokeskjema__input"
          bredde="XL"
          onChange={this.vedEndretSokFelt}
          ref={this.state.sokStreng}
          placeholder="F.nr./d-nr./saksnr."
        />

        <Nav.Knapp className="sokeskjema__knapp">Søk</Nav.Knapp>
      </form>
    );
  }
}

SokSkjema.propTypes = {
  handleSubmit: PT.func.isRequired,
  lagreSokString: PT.func.isRequired,
  match: PT.object.isRequired,
  history: PT.object.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  lagreSokString: (verdi) => dispatch(change(KV.Form.SOK_ETTER_SAK, "sokStreng", verdi)),
});

const sokSkjemaForm = reduxForm({
  form: KV.Form.SOK_ETTER_SAK,
  initialValues: { sokFelt: "" },
  onSubmit: () => {},
})(SokSkjema);

export default withRouter(connect(null, mapDispatchToProps)(sokSkjemaForm));
