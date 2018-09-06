import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as MPT from '../../../proptypes';

import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../../../utils/kodeverk';
import { KodeverkSelectors } from '../../../ducks/kodeverk';

import EnkeltLand from './enkeltLand';
import MultiLand from './multiLand';

import './landvelger.css';

/** Hjelpere som deles av hovedkomponent og subkomponentene EnkeltLand og MultiLand */
const landTekstFormat = landObjekt => (`${kodeverkObjektTilTerm(landObjekt)} (${kodeverkObjektTilKode(landObjekt)})`);
const kodeTilObjekt = (kode, alleLandkoder) => alleLandkoder.find(enkeltKode => kodeverkObjektTilKode(enkeltKode) === kode);


/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
const LandVelger = props => {
  const { landkoder, multiLand } = props;
  return (
    <div>
      {multiLand ? (<MultiLand {...props} />) : (<EnkeltLand {...props} />)}
      <div className="landliste__dataliste">
        <datalist id="alleLand">
          {landkoder.map(item => (<option key={kodeverkObjektTilKode(item)} value={landTekstFormat(item)} />))}
        </datalist>
      </div>
    </div>
  );
};

LandVelger.propTypes = {
  feltNavn: PT.string.isRequired,
  multiLand: PT.bool,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  label: PT.string,
  leggTilCallback: PT.func,
  slettCallback: PT.func,
};

LandVelger.defaultProps = {
  multiLand: false,
  label: undefined,
  leggTilCallback: () => {},
  slettCallback: () => {},
};

const mapStateToProps = state => ({
  landkoder: KodeverkSelectors.landkoderSelector(state),
});

export { kodeTilObjekt, landTekstFormat };

export default connect(mapStateToProps)(LandVelger);
