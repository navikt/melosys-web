import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';
import { DatoOmradeDescription } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import EnkeltSak from './enkeltSak';
import EksisterendeSaker from './eksisterendeSaker';
//const erValgt = () => valgtSaksnummer() === saksnummer;
const FagsakVelger = props => {
  const {
    behandlingstyper, fagsakListe, valgtSaksnummer,
  } = props;

  const radioValg = fagsakListe.reduce((samling, sak) =>
    ([...samling, { value: sak.saksnummer, innhold: <EnkeltSak sak={sak} /> }]), []);

  return (
    <Fragment>
      <div className="eksisterendeSaker">
        {<Skjema.CustomRadioPanelGruppe
          feltNavn="saksnummer"
          radios={radioValg}
        />}
        { fagsakListe.length === 0 && 'Ingen eksisterende saker funnet.'}
      </div>
      {/*<Skjema.Select feltNavn="behandlingstype" bredde="fullbredde" label="Behandlingstype" emptyFieldDisabled={false} >
        {
          behandlingstyper &&
          behandlingstyper
            .filter(elem => elem.kode !== MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
              && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL
              && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED)
            .map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)
        }
      </Skjema.Select>*/}
    </Fragment>
  );
};

FagsakVelger.propTypes = {
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  fagsakListe: PT.array.isRequired,
  knyttTilEksisterendeSak: PT.func.isRequired,
  valgtSaksnummer: PT.func.isRequired,
};
const selector = formValueSelector('journalforing');
const mapStateToProps = state => ({
  valgtSaksnummer: () => selector(state, 'saksnummer'),
});

export default connect(mapStateToProps)(FagsakVelger);
