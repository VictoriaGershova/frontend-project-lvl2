import defaultFormater from './default';
import jsonFormater from './json';
import plainFormater from './plain';

export default (diff, format) => {
  switch (format) {
    case 'plain':
      return plainFormater(diff);
    case 'json':
      return jsonFormater(diff);
    default:
      return defaultFormater(diff);
  }
};
