import minus from './minus.svg';
import tilsette from './tilsette.svg';

export const getSvgPath = kind => {
  switch (kind) {
    case 'tilsette': return tilsette;
    case 'minus': return minus;
    default: return null;
  }
};
