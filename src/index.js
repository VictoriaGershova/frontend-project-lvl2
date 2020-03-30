import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import serialize from './formatters';

const operations = {
  insert: 'insert',
  update: 'update',
  delete: 'delete',
  unchanged: 'unchanged',
};

// compare two values and return operation done on them
const getOperation = (oldValue, newValue) => {
  if (typeof oldValue === 'undefined') {
    return operations.insert;
  }
  if (typeof newValue === 'undefined') {
    return operations.delete;
  }
  if (!_.isEqual(oldValue, newValue)) {
    return operations.update;
  }
  return operations.unchanged;
};

/* return configuration changes (diff) as an object with properties (keys):
  [property]:
    { value: value | { oldValue, newValue },
      children: { diff for children } | {},
      operation: 'input'/'update'/'delete'/'unchanged',
    }
*/
const genDiff = (config1, config2) => {
  const properties = _.uniq(Object.keys(config1).concat(Object.keys(config2)));
  const diff = properties.reduce(
    (acc, property) => {
      const [oldValue, newValue] = [config1[property], config2[property]];
      const operation = getOperation(oldValue, newValue);
      let value;
      if (operation === operations.delete || operation === operations.unchanged) {
        value = oldValue;
      } else if (operation === operations.insert) {
        value = newValue;
      } else {
        value = { oldValue, newValue };
      }
      const children = (
        oldValue instanceof Object && newValue instanceof Object ? genDiff(oldValue, newValue) : {}
      );
      return { ...acc, [property]: { value, children, operation } };
    },
    {},
  );
  return diff;
};

export default (pathFile1, pathFile2, format = 'default') => {
  const [data1, data2] = [pathFile1, pathFile2].map(
    (pathFile) => {
      const response = fs.readFileSync(pathFile, 'utf-8');
      const parser = getParser(path.extname(pathFile).substring(1));
      const data = response === '' ? {} : parser(response);
      return data;
    },
  );
  const diff = genDiff(data1, data2);
  const result = serialize(diff, format);
  return result;
};
