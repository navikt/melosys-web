import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import { BOOLSK } from '../../../constants';

const SendForvaltningsMelding = props => {
  const clsBehandlingsPanel = {
    margin: '0.5em 0',
    padding: '0.5em',
  };
  const { ikkeSendForvaltingsmelding } = props;
  return (
    <div style={clsBehandlingsPanel}>
      <Nav.typo.Element>Skal melding om saksbehandlingtid sendes automatisk?</Nav.typo.Element>

      <Skjema.RadioGruppe feltNavn="ikkeSendForvaltingsmelding" label="">
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Ja, melding skal sendes automatisk"
          value={BOOLSK.USANN}
        />
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
          value={BOOLSK.SANN}
        />
        {
          ikkeSendForvaltingsmelding &&
            <Fragment>
              <Nav.typo.Element>Oppgi kontaktperson hos fullmektig som skal motta meldingen hvis dette er oppgitt</Nav.typo.Element>
              <Skjema.Input
                feltNavn="representantKontaktPerson"
                label=""
                placeholder="Skriv inn..."
              />
            </Fragment>
        }
      </Skjema.RadioGruppe>
    </div>
  );
};
SendForvaltningsMelding.propTypes = {
  ikkeSendForvaltingsmelding: PT.bool.isRequired,
};
const selector = formValueSelector('journalforing');
const mapStateToProps = state => ({
  ikkeSendForvaltingsmelding: selector(state, 'ikkeSendForvaltingsmelding'),
});
export default connect(mapStateToProps)(SendForvaltningsMelding);
