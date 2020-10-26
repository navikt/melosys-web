import React, { FormEventHandler } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { RootState } from 'AppTypes';

import * as KV from '../../kodeverk';

import Menypanel, { Menypunkt } from '../menypanel';

import { behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';

const mapStateToProps = (state: RootState) => ({
  initialValues: {
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
  },
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type RegistreringProps = PropsFromRedux & {
  menypunkter: Menypunkt[],
};

const Registrering = ({
  menypunkter,
}: RegistreringProps & InjectedFormProps<KV.Form.RegistreringPanelerFormData, RegistreringProps>) => {
  const submitHandler: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
  };

  return (
    <form name="registrering" id="soknad" onSubmit={submitHandler}>
      <Menypanel
        menypunkter={menypunkter}
      />
    </form>
  );
};

const MenypanelForm = reduxForm<KV.Form.RegistreringPanelerFormData, RegistreringProps>({
  form: KV.Form.REGISTRERING_PANELER,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Registrering);

export default connector(MenypanelForm);
