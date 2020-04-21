import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';
import states from './state';
import types from './type';

/*
  diff as an array of objects
*/
const genDiff = (data1, data2) => {
  const build = (property, oldData, newData) => {
    const oldValue = oldData[property];
    const newValue = newData[property];
    if (!_.has(oldData, property)) {
      return {
        property,
        type: types.leaf,
        newValue,
        state: states.added,
      };
    }
    if (!_.has(newData, property)) {
      return {
        property,
        type: types.leaf,
        oldValue,
        state: states.deleted,
      };
    }
    if (oldValue instanceof Object && newValue instanceof Object) {
      return {
        property,
        type: types.tree,
        children: genDiff(oldValue, newValue),
      };
    }
    if (oldValue === newValue) {
      return {
        property,
        type: types.leaf,
        oldValue,
        state: states.unchanged,
      };
    }
    return {
      property,
      type: types.leaf,
      oldValue,
      newValue,
      state: states.changed,
    };
  };
  const properties = _.union(_.keys(data1), _.keys(data2));
  const diff = properties
    .sort()
    .map((property) => build(property, data1, data2));
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
