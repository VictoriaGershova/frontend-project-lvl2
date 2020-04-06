import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';

const operations = {
  insert: 'insert',
  update: 'update',
  delete: 'delete',
  unchanged: 'unchanged',
};

// compare two values and return operation done on them
const getDiffOperation = (oldValue, newValue) => {
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

const getDiffValue = (operation, oldValue, newValue) => {
  if (operation === operations.delete || operation === operations.unchanged) {
    return oldValue;
  }
  if (operation === operations.insert) {
    return newValue;
  }
  return { oldValue, newValue };
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
      const operation = getDiffOperation(oldValue, newValue);
      const value = getDiffValue(operation, oldValue, newValue);
      const children = (
        oldValue instanceof Object && newValue instanceof Object ? genDiff(oldValue, newValue) : {}
      );
      return { ...acc, [property]: { value, children, operation } };
    },
    {},
  );
  return diff;
};

export default (pathFile1, pathFile2, format) => {
  const getFileData = (pathFile) => {
    const fileContent = fs.readFileSync(pathFile, 'utf-8');
    const parse = getParser(path.extname(pathFile).substring(1));
    const data = parse(fileContent);
    return data;
  };
  const data1 = getFileData(pathFile1);
  const data2 = getFileData(pathFile2);
  const diff = genDiff(data1, data2);
  const result = render(diff, format);
  return result;
};
