import listFormater from './list';
import jsonFormater from './json';
import plainFormater from './plain';

const sortProp = (properties) => properties.sort(
  ({ property: propertyA }, { property: propertyB }) => {
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
  list: listFormater,
  plain: plainFormater,
  json: jsonFormater,
};

export default (diff, format) => formatters[format](diff, sortProp);
