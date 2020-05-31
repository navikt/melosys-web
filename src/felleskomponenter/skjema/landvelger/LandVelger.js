import React from 'react';
import PT from 'prop-types';

import MKV from '../../../melosyskodeverk';

import EnkeltLand from './enkeltLand';
import MultiLand from './multiLand';

import { lagDatalistID, landTekstFormat } from './utils';

import './landvelger.css';

/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
const LandVelger = props => {
  const { multiLand } = props;
  const dataListID = lagDatalistID();

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
  bredde: PT.string,
};

LandVelger.defaultProps = {
  disabled: false,
  multiLand: false,
  label: undefined,
  bredde: 'XL',
};

export default LandVelger;
