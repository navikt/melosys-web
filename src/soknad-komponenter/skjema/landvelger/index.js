import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import EnkeltLand from './enkeltLand';
import MultiLand from './multiLand';
import { kodeverkObjektTilKode } from '../../../utils/kodeverk';

import './landvelger.css';

/** Hjelpere som deles av hovedkomponent og subkomponentene EnkeltLand og MultiLand */
const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);
const kodeTilObjekt = (kode, alleLandkoder) => alleLandkoder.find(enkeltKode => kodeverkObjektTilKode(enkeltKode) === kode);

const uuid = require('uuid/v4');

/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
const LandVelger = props => {
  const { multiLand } = props;
  const dataListID = `datalist-${uuid()}`;

  return (
    <div>
      {multiLand
        ? (<MultiLand {...props} landkoder={MKV.KTObjects.landkoder} dataListID={dataListID} />)
        : (<EnkeltLand {...props} landkoder={MKV.KTObjects.landkoder} dataListID={dataListID} />)}
      <div className="landliste__dataliste">
        <datalist id={dataListID}>
          {MKV.KTObjects.landkoder.map(item => (<option key={item.kode} value={landTekstFormat(item)} />))}
        </datalist>
      </div>
    </div>
  );
};

LandVelger.propTypes = {
  disabled: PT.bool,
  feltNavn: PT.string.isRequired,
  multiLand: PT.bool,
  label: PT.string,
};

LandVelger.defaultProps = {
  disabled: false,
  multiLand: false,
  label: undefined,
};

export { kodeTilObjekt, landTekstFormat };

export default LandVelger;
