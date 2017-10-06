import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { validForm, rules } from 'react-redux-form-validation';
import { Hovedknapp } from 'nav-frontend-knapper';

import { nyHenvendelse } from '../../ducks/arbeidsgiver';

import Input from '../../felles-komponenter/skjema/input/input';
import Radio from '../../felles-komponenter/skjema/input/radio';
import Select from '../../felles-komponenter/skjema/input/select';
import Textarea from '../../felles-komponenter/skjema/textarea/textarea';
import Datovelger from '../../felles-komponenter/skjema/datovelger/datovelger';

const fnrValid = value => (
  /^[0-9]{11}$/.test(value) ? undefined : 'Fnr må ha 11 siffer'
);

const BESKRIVELSE_MAKS_LENGDE = 500;

const ArbeidsgiverForm = ({ handleSubmit, errorSummary }) => (
  <div className="arbeidsforhold-virksomhet">
    <h2 className="typo-undertittel">
      <span>Arbeidsgiver</span>
    </h2>
    <form onSubmit={handleSubmit}>
      {errorSummary}
      <Input
        feltNavn="fnr"
        label="Fnr. eller dnr."
        bredde="xl"
        autoFocus
      />
      <Datovelger
        className="datovelger"
        feltNavn="Et navn"
        label="Datovelger"
        tidligsteFom={new Date()}
        tidligsteTom={new Date()}
      />
      <div className="skjema">
        <Radio
          feltNavn="frukt"
          label="Eple"
          value="eple"
          id="eple-radio"
        />
        <Radio
          feltNavn="frukt"
          label="Druer"
          value="druer"
          id="druer-radio"
        />
        <Radio
          feltNavn="frukt"
          label="Banan"
          value="banan"
          id="banan-radio"
        />
        <Radio
          feltNavn="frukt"
          label="Sjokolade"
          value="sjokolade"
          id="sjokolade-radio"
          disabled="disabled"
        />
      </div>
      <Textarea
        label="dialog.tekst-label"
        feltNavn="tekst"
        placeholder="Skriv her"
        maxLength={BESKRIVELSE_MAKS_LENGDE}
        visTellerFra={100}
      />
      <div className="skjema">
        <Select
          feltNavn="land"
          label="Velg land"
          id="land-select"
          bredde="xl"
        >
          <option value="norge">Norge</option>
          <option value="sverige">Sverige</option>
          <option value="danmark">Danmark</option>
        </Select>
      </div>
      <Hovedknapp type="hoved">Søk</Hovedknapp>
    </form>
  </div>
);

ArbeidsgiverForm.propTypes = {
  handleSubmit: PT.func.isRequired,
  errorSummary: PT.object,
};

ArbeidsgiverForm.defaultProps = {
  errorSummary: {},
};

const ArbeidsgiverReduxForm = validForm({
  form: 'arbeidsgiverform',
  errorSummaryTitle: 'Fix these errors',
  validate: {
    fnr: [rules.required, fnrValid],
    tekst: [],
    frukt: [],
    snacks: [],
  },
})(ArbeidsgiverForm);

const fnr = '12345678901';

const mapStateToProps = () => ({
  initialValues: {
    fnr,
  },
});

const mapDispatchToProps = () => ({
  onSubmit: (dialogData, dispatch, props) => {
    const nyHenvendelsePromise = nyHenvendelse({
      ...dialogData,
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
