import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';

const operations = {
  insert: 'i',
  update: 'u',
  delete: 'd',
  unchanged: 'n',
};

const tabLength = 4;

// compare two values and return operation done on them
const getOperation = (value1, value2) => {
  if (typeof value1 === 'undefined') {
    return operations.insert;
  }
  if (typeof value2 === 'undefined') {
    return operations.delete;
  }
  if (!_.isEqual(value1, value2)) {
    return operations.update;
  }
  return operations.unchanged;
};

/* return configuration changes (diff) as an array of objects:
  { key, value1, value2, children: [diff for children]|[], operation: 'i'/'u'/'d'/'n' }
*/
const genDiff = (config1, config2) => {
  const configKeys = _.uniq(Object.keys(config1).concat(Object.keys(config2)));
  const diff = configKeys.reduce(
    (acc, key) => {
      const [value1, value2] = [config1[key], config2[key]];
      const operation = getOperation(value1, value2);
      const children = (
        value1 instanceof Object && value2 instanceof Object ? genDiff(value1, value2) : []
      );
      const itemDiff = {
        key,
        value1,
        value2,
        children,
        operation,
      };
      return [...acc, itemDiff];
    },
    [],
  );
  return diff;
};

const stringifyValue = (value) => {
  const stringifyObject = (obj, depth = 0) => {
    const lines = Object.keys(obj)
      .map((key) => {
        const v = obj[key];
        const strV = v instanceof Object ? stringifyObject(v, depth + 1) : v;
        return `${' '.repeat(tabLength * (depth + 1))}${key}: ${strV}`;
      });
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`].join('\n');
  };
  if (value instanceof Object) {
    return stringifyObject(value);
  }
  return `${value}`;
};

const serializeDiff = (diff) => {
  const serializeDiffItems = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before key including operation sign
    const lines = diffItems
      .sort(({ key: keyA }, { key: keyB }) => {
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
        return 0;
      })
      .reduce(
        (acc, {
          key,
          value1,
          value2,
          children,
          operation,
        }) => {
          let newLines;
          if (operation === operations.insert) {
            const valueLines = stringifyValue(value2).split('\n');
            newLines = [
              `${'+ '.padStart(margeWidth, ' ')}${key}: ${valueLines[0]}`,
              ...valueLines
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`),
            ];
          }
          if (operation === operations.delete) {
            const valueLines = stringifyValue(value1).split('\n');
            newLines = [
              `${'- '.padStart(margeWidth, ' ')}${key}: ${valueLines[0]}`,
              ...valueLines
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`),
            ];
          }
          if (operation === operations.unchanged) {
            const valueLines = stringifyValue(value1).split('\n');
            newLines = [
              `${'  '.padStart(margeWidth, ' ')}${key}: ${valueLines[0]}`,
              ...valueLines
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`),
            ];
          }
          if (children.length > 0) {
            const childrenLines = serializeDiffItems(children, depth + 1);
            newLines = [
              `${' '.repeat(margeWidth)}${key}: ${childrenLines[0]}`,
              ...(childrenLines
                .filter((line, index) => index !== 0)),
            ];
          } else if (operation === operations.update) {
            const [valueLines1, valueLines2] = [value1, value2]
              .map((value) => stringifyValue(value).split('\n'));
            newLines = [
              `${'- '.padStart(margeWidth, ' ')}${key}: ${valueLines1[0]}`,
              ...(valueLines1
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`)),
              `${'+ '.padStart(margeWidth, ' ')}${key}: ${valueLines2[0]}`,
              ...(valueLines2
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`)),
            ];
          }
          return [
            ...acc,
            ...newLines,
          ];
        },
        [],
      );
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = serializeDiffItems(diff);
  return lines.join('\n');
};

export default (pathFile1, pathFile2) => {
  const [data1, data2] = [pathFile1, pathFile2].map(
    (pathFile) => {
      const response = fs.readFileSync(pathFile, 'utf-8');
      const parser = getParser(path.extname(pathFile).substring(1));
      const data = parser(response);
      return data;
    },
  );
  const diff = genDiff(data1, data2);
  return serializeDiff(diff);
};
