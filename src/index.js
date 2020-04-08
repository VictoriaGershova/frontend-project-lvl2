import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';
import build, { addSubproperties, isChanged } from './propertydiff';

/*
  diff as a tree:
  [
    function | [function, [genDiff for subproperties]]
  ]
*/
const genDiff = (data1, data2) => {
  const properties = _.union(_.keys(data1), _.keys(data2));
  const diff = properties.map(
    (property) => {
      const [oldValue, newValue] = [data1[property], data2[property]];
      const propDiff = build(property, oldValue, newValue);
      if (isChanged(propDiff) && oldValue instanceof Object && newValue instanceof Object) {
        return addSubproperties(propDiff, genDiff(oldValue, newValue));
      }
      return propDiff;
    },
  );
  return diff;
};

export default (beforePathFile, afterPathFile, format) => {
  const getData = (pathFile) => {
    const fileContent = fs.readFileSync(pathFile, 'utf-8');
    const parse = getParser(path.extname(pathFile).substring(1));
    const data = parse(fileContent);
    return data;
  };
  const data1 = getData(beforePathFile);
  const data2 = getData(afterPathFile);
  const diff = genDiff(data1, data2);
  const formatted = render(diff, format);
  return formatted;
};
