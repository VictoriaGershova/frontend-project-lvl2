import defaultFormater from './default';
import jsonFormater from './json';
import plainFormater from './plain';

const sortProp = (properties) => properties.sort(
  (propertyA, propertyB) => {
    if (propertyA < propertyB) {
      return -1;
    }
    if (propertyA > propertyB) {
      return 1;
    }
    return 0;
  },
);

const formatters = {
  default: defaultFormater,
  plain: plainFormater,
  json: jsonFormater,
};

export default (diff, format = 'default') => formatters[format](diff, sortProp);
