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
const genDiff = (beforeConfig, afterConfig) => {
  const properties = _.union(_.keys(beforeConfig), _.keys(afterConfig));
  const diff = properties.map(
    (property) => {
      const [oldValue, newValue] = [beforeConfig[property], afterConfig[property]];
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
  const getConfig = (pathFile) => {
    const fileContent = fs.readFileSync(pathFile, 'utf-8');
    const parse = getParser(path.extname(pathFile).substring(1));
    const config = parse(fileContent);
    return config;
  };
  const beforeConfig = getConfig(beforePathFile);
  const afterConfig = getConfig(afterPathFile);
  const diffConfig = genDiff(beforeConfig, afterConfig);
  const formatted = render(diffConfig, format);
  return formatted;
};
