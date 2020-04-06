import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';

/* return configuration changes (diff) as an object with properties (keys):
  [property]:
    { value: value | { oldValue, newValue },
      children: { diff for children } | {},
      operation: 'insert'/'update'/'delete'/'unchanged',
    }
*/
const genDiff = (beforeConfig, afterConfig) => {
  const build = (oldValue, newValue) => {
    const operations = {
      insert: 'insert',
      update: 'update',
      delete: 'delete',
      unchanged: 'unchanged',
    };
    if (typeof oldValue === 'undefined') {
      return { value: newValue, children: {}, operation: operations.insert };
    }
    if (typeof newValue === 'undefined') {
      return { value: oldValue, children: {}, operation: operations.delete };
    }
    if (_.isEqual(oldValue, newValue)) {
      return { value: oldValue, children: {}, operation: operations.unchanged };
    }
    const hasChildren = oldValue instanceof Object && newValue instanceof Object;
    return {
      value: { oldValue, newValue },
      children: hasChildren ? genDiff(oldValue, newValue) : {},
      operation: operations.update,
    };
  };
  const properties = _.union(_.keys(beforeConfig), _.keys(afterConfig));
  const diff = properties.reduce(
    (acc, property) => {
      const [oldValue, newValue] = [beforeConfig[property], afterConfig[property]];
      return { ...acc, [property]: build(oldValue, newValue) };
    },
    {},
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
