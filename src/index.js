import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';
import states from './state';

/*
  diff as an array of functions
*/
const genDiff = (data1, data2) => {
  const build = (property, oldData, newData) => {
    const oldValue = oldData[property];
    const newValue = newData[property];
    if (!_.has(oldData, property)) {
      return () => ({
        property,
        state: states.added,
        value: newValue,
      });
    }
    if (!_.has(newData, property)) {
      return () => ({
        property,
        state: states.deleted,
        value: oldValue,
      });
    }
    if (_.isEqual(oldValue, newValue)) {
      return () => ({
        property,
        state: states.unchanged,
        value: oldValue,
      });
    }
    const hasInnerChanges = (oldValue instanceof Object && newValue instanceof Object);
    return () => ({
      property,
      state: states.changed,
      value: { oldValue, newValue },
      hasInnerChanges,
      children: (hasInnerChanges ? genDiff(oldValue, newValue) : []),
    });
  };
  const properties = _.union(_.keys(data1), _.keys(data2));
  const diff = properties
    .map((property) => build(property, data1, data2))
    .sort((propertyDiffA, propertyDiffB) => {
      const propertyA = propertyDiffA().property;
      const propertyB = propertyDiffB().property;
      if (propertyA < propertyB) {
        return -1;
      }
      if (propertyA > propertyB) {
        return 1;
      }
      return 0;
    });
  return diff;
};

export default (filePath1, filePath2, format) => {
  const getData = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parse = getParser(path.extname(filePath).substring(1));
    const data = parse(fileContent);
    return data;
  };
  const data1 = getData(filePath1);
  const data2 = getData(filePath2);
  const diff = genDiff(data1, data2);
  const formattedDiff = render(diff, format);
  return formattedDiff;
};
