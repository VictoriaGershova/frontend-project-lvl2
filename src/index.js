import fs from 'fs';
import _ from 'lodash';
import pjson from '../package.json';

// return JSON file data transformed to object by path
const getFileData = (pathToFile) => {
  const fileData = fs.readFileSync(pathToFile);
  return JSON.parse(fileData);
};

// generate difference of two objects
// return string
const getDataDiff = (obj1, obj2) => {
  const ar1 = Object.entries(obj1);
  const ar2 = Object.entries(obj2);
  const deleted = _.differenceWith(ar1, ar2, _.isEqual).map((p) => [...p, '-']);
  const added = _.differenceWith(ar2, ar1, _.isEqual).map((p) => [...p, '+']);
  const same = _.intersectionWith(ar1, ar2, _.isEqual).map((p) => [...p, '']);
  const diff = [...deleted, ...added, ...same]
    .sort()
    .map(([k, v, sign]) => `\t${sign} ${k}: ${v}\n`)
    .join('');
  return `{\n${diff}\n}`;
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
