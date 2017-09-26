import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { validForm, rules } from 'react-redux-form-validation';

import { nyHenvendelse } from '../../ducks/arbeidsgiver';

import { Hovedknapp } from 'nav-frontend-knapper';
import Input from '../../felles-komponenter/skjema/input/input';

const fnrValid = (value) => {
  return /^[0-9]{11}$/.test(value) ? undefined : 'Fnr må ha 11 siffer';
};

function ArbeidsgiverForm({handleSubmit, errorSummary}) {
  return (
    <div>
      <h2 className="typo-undertittel"><span>Arbeidsgiver</span></h2>
      <form onSubmit={ handleSubmit }>
        {errorSummary}
        <Input
          feltNavn="fnr"
          label="Fnr. eller dnr."
          bredde="xl"
          autoFocus
        />
        <Hovedknapp>Søk</Hovedknapp>
      </form>
    </div>
  )
}


ArbeidsgiverForm.propTypes = {
  handleSubmit: PT.func.isRequired
};


const ArbeidsgiverReduxForm = validForm({
  form: 'arbeidsgiverform',
  errorSummaryTitle: 'Fix these errors',
  validate: {
  fnr: [rules.required, fnrValid]
}
})(ArbeidsgiverForm);

const fnr = '12345678901';

const mapStateToProps = (state) => {
  return {
    initialValues: {
      fnr,
    }
  }
};

const mapDispatchToProps = () => ({
  onSubmit: (dialogData, dispatch, props) => {
    const nyHenvendelsePromise = nyHenvendelse({
      ...dialogData
    })(dispatch);
    const onComplete = props.onComplete;
    nyHenvendelsePromise.then(action => {
      props.reset();
      if (onComplete) {
        onComplete(action.data);
      }
    });
  },
});

const ArbeidsgiverFormReduxFormConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(ArbeidsgiverReduxForm);

export default ArbeidsgiverFormReduxFormConnected;