import React, { useState, useEffect, Fragment } from 'react';
import PT from 'prop-types';
import { getFormValues, change } from 'redux-form';
import { connect } from 'react-redux';

import * as Skjema from './skjema';
import * as Api from '../services/api';
import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';

import './brukernavnskjema.css';

export const Brukernavnskjema = ({
  formValues,
  settFormBruker,
  className,
}) => {
  const [brukerSpinner, setBrukerSpinner] = useState(false);
  const [brukerHentetVedOppstart, setBrukerHentetVedOppstart] = useState(false);

  const hentBruker = async fnrdnr => {
    setBrukerSpinner(true);

    if (fnrdnr) {
      try {
        const brukerRespons = await Api.Personer.hentPerson(fnrdnr);
        settFormBruker(brukerRespons);
      } catch (e) {
        settFormBruker('');
        Utils.logger.error(e);
      }
    }

    setBrukerSpinner(false);
  };

  const hentBrukerMedID = () => {
    hentBruker(formValues.brukerID);
  };

  useEffect(() => {
    if (formValues.brukerID && !brukerHentetVedOppstart) {
      hentBrukerMedID();
      setBrukerHentetVedOppstart(true);
    }
  }, [formValues.brukerID]);

  const { bruker = {} } = formValues;
  const { sammensattNavn = '' } = bruker;

  return (
    <div className={className}>
      <Skjema.Input
        onBlur={hentBrukerMedID}
        className="fetTekst"
        label="Brukers f.nr eller d.nr"
        feltNavn="brukerID"
      />
      {
        sammensattNavn &&
        <Fragment>
          <Nav.typo.Element>Brukers fulle navn</Nav.typo.Element>
          <Nav.typo.Normaltekst>
            { brukerSpinner && <Nav.NavFrontendSpinner /> }
            { sammensattNavn }
          </Nav.typo.Normaltekst>
        </Fragment>
      }
    </div>
  );
};

Brukernavnskjema.propTypes = {
  form: PT.string.isRequired,
  formValues: PT.object,
  settFormBruker: PT.func.isRequired,
  className: PT.string,
};

Brukernavnskjema.defaultProps = {
  formValues: {},
  className: undefined,
};

const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.form)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  settFormBruker: brukerNavn => dispatch(change(ownProps.form, 'bruker', brukerNavn)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Brukernavnskjema);
