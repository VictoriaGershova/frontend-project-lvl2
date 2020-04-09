import listFormater from './list';
import jsonFormater from './json';
import plainFormater from './plain';

const sortDiff = (diff) => diff.sort(
  (propertyDiffA, propertyDiffB) => {
    const propertyA = propertyDiffA().property;
    const propertyB = propertyDiffB().property;
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

export default (diff, format) => formatters[format](diff, sortDiff);
