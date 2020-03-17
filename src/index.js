import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import pjson from '../package.json';

const getFileData = (pathFile) => {
  const data = fs.readFileSync(pathFile, 'utf-8');
  const parser = getParser(path.extname(pathFile).substring(1));
  return parser(data);
};

// return diference of two objects as a string
const getDataDiff = (obj1, obj2) => {
  const ar1 = Object.entries(obj1);
  const ar2 = Object.entries(obj2);
  const deleted = _.differenceWith(ar1, ar2, _.isEqual).map((p) => [...p, '-']);
  const added = _.differenceWith(ar2, ar1, _.isEqual).map((p) => [...p, '+']);
  const same = _.intersectionWith(ar1, ar2, _.isEqual).map((p) => [...p, ' ']);
  const diff = [...deleted, ...added, ...same]
    .sort()
    .map(([k, v, sign]) => `\t${sign} ${k}: ${v}\n`)
    .join('');
  return `{\n${diff}}`;
};

const genDiff = (pathToFile1, pathToFile2) => {
  const diff = getDataDiff(
    getFileData(pathToFile1),
    getFileData(pathToFile2),
  );
  return diff;
};

export const getVersion = () => pjson.version;
export default genDiff;
