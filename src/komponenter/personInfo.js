import React from 'react';
import { formatterDatoTilNorsk } from '../utils/dato';
import * as KV from '../kodeverk';
import EnkeltDato from './datoOmrade/enkeltDato';
import * as MPT from '../proptypes';

const PersonInfo = ({
  person: {
    fnr, statsborgerskapDato, statsborgerskap, foedselsdato, kjoenn, sivilstand,
  },
}) => (
  <dl className="person__detaljer">
    <dt>Fnr / dnr:</dt>
    <dd>{fnr}</dd>
    <dt>Statsborgerskap pr {formatterDatoTilNorsk(statsborgerskapDato)}:</dt>
    <dd>{KV.objektTilTerm(statsborgerskap)}</dd>
    <dt>Fødselsdato:</dt>
    <dd><EnkeltDato dato={foedselsdato} /></dd>
    <dt>Kjønn:</dt>
    <dd>{KV.objektTilTerm(kjoenn)}</dd>
    <dt>Sivilstand:</dt>
    <dd>{KV.objektTilTerm(sivilstand)}</dd>
  </dl>
);
PersonInfo.propTypes = {
  person: MPT.Person.isRequired,
};
export default PersonInfo;
