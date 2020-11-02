import React, { useState } from 'react';

import { FieldArray, WrappedFieldArrayProps } from 'redux-form';

import * as Nav from '../../../../../utils/navFrontend';
import * as Mui from '../../../../ui';
import * as KV from '../../../../../kodeverk';
import * as Ikoner from '../../../../../resources/images';

import UtfyltUtenlandskIdent from './utfyltutenlandskident';
import EnkeltUtenlandskIdentSkjema from './enkeltutenlandskidentskjema';

import { UtenlandskIdent } from './types';

type InnerUtenlandskIdComponentProps = WrappedFieldArrayProps<UtenlandskIdent> & {
  redigerbart: boolean,
}

const InnerUtenlandskIdComponent = (props: InnerUtenlandskIdComponentProps) => {
  const [redigerer, setRedigerer] = useState(false);

  const {
    redigerbart, fields,
  } = props;
  const { push, remove } = fields;
  const felter = props.fields.getAll() || [];
  const leggTilTomtFelt = () => push({ ident: '', landkode: '' });

  const tittel = KV.Menypunkter.Person.undertitler.utenlandskID;

  if (!redigerer && felter.length === 0) {
    return (
      <Nav.Fieldset legend={tittel}>
        {
          redigerbart &&
          <Mui.Knappelenke
            onClick={() => {
              setRedigerer(true);
              leggTilTomtFelt();
            }}
            ikon={Ikoner.Add}
          >
            Legg til ID-nummer
          </Mui.Knappelenke>
        }
      </Nav.Fieldset>
    );
  }

  if (!redigerer) {
    return <UtfyltUtenlandskIdent
      redigerbart={redigerbart}
      tittel={tittel}
      utenlandskeIdenter={felter}
      pencilClickHandler={() => setRedigerer(true)}
      binClickHandler={() => fields.removeAll()}
    />;
  }

  return (
    <Nav.Fieldset legend={tittel}>
      <div>
        {
          felter.map((felt, indeks) => <EnkeltUtenlandskIdentSkjema
            /* eslint-disable react/no-array-index-key */
            key={indeks}
            redigerbart={redigerbart}
            slett={() => remove(indeks)}
            overordnetFeltNavn={`utenlandskIdent[${indeks}]`}
          />)
        }
        {
          redigerbart &&
          <Nav.Row>
            <Nav.Column xs="12">
              <Mui.Knappelenke
                onClick={leggTilTomtFelt}
                ikon={Ikoner.Add}
              >
                Legg til ny rad
              </Mui.Knappelenke>
            </Nav.Column>
          </Nav.Row>
        }
        <Nav.Row>
          <Nav.Column xs="12">
            <Mui.Knapp
              disabled={!redigerbart}
              mini
              onClick={() => setRedigerer(false)}
              type="hoved"
              style={{ marginTop: '20px' }}
            >
              Lagre
            </Mui.Knapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </Nav.Fieldset>
  );
};

interface UtenlandskIdWrapperProps {
  redigerbart: boolean,
}

const UtenlandskIdWrapper = ({
  ...rest
}: UtenlandskIdWrapperProps) => (
  <FieldArray
    name="utenlandskIdent"
    component={InnerUtenlandskIdComponent}
    props={rest}
    rerenderOnEveryChange
  />
);

export default UtenlandskIdWrapper;
