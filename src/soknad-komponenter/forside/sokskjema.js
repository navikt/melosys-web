import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { reduxForm, change } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';

import './sokeskjema.css';

const SokSkjema = props => {
  const [sokStreng, setState] = useState('');
  const inputRef = useRef(null);

  const vedSokSubmit = form => {
    const { lagreSokString, handleSubmit, history } = props;

    lagreSokString(sokStreng);
    handleSubmit(form);
    history.push(`/sok/${sokStreng}`);
  };

  const vedEndretSokFelt = event => {
    setState(event.target.value);
  };

  const oppdaterLokalSokState = str => {
    setState(str);
  };
  useEffect(() => {
    const { fnr } = props.match.params;
    oppdaterLokalSokState(fnr);
  }, []);

  return (
    <Nav.Panel>
      <Nav.Systemtittel>Søke etter saker</Nav.Systemtittel>
      <form className="sokeskjema" onSubmit={vedSokSubmit}>
        <Nav.Input
          label=""
          className="sokeskjema__input"
          bredde="XL"
          onChange={vedEndretSokFelt}
          ref={inputRef}
          placeholder="fnr / dnr"
        />
        <Nav.Knapp className="sokeskjema__knapp">Søk</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};

SokSkjema.propTypes = {
  handleSubmit: PT.func.isRequired,
  lagreSokString: PT.func.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
};

const mapDispatchToProps = dispatch => ({
  lagreSokString: verdi => dispatch(change(KV.Form.SOK_ETTER_SAK, 'sokStreng', verdi)),
});

export default withRouter(connect(null, mapDispatchToProps)(reduxForm({
  form: KV.Form.SOK_ETTER_SAK,
  initialValues: { sokFelt: '' },
  onSubmit: () => {},
})(SokSkjema)));
