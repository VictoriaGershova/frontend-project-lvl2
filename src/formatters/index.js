import listFormater from './list';
import jsonFormater from './json';
import plainFormater from './plain';
import { getName } from '../propertydiff';

const sortDiff = (diff) => diff.sort(
  (propDiffA, propDiffB) => {
    const propertyA = getName(propDiffA);
    const propertyB = getName(propDiffB);
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
