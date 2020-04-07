import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getParser from './parser';
import render from './formatters';

/* return configuration changes tree (diff) as an array of objects:
  {
    property,
    value: value | { oldValue, newValue },
    subproperties: [diff for subproperties] | [],
    state: 'added'/'changed'/'deleted'/'unchanged',
  }
*/
const genDiff = (beforeConfig, afterConfig) => {
  const build = (property, oldValue, newValue) => {
    const states = {
      added: 'added',
      changed: 'changed',
      deleted: 'deleted',
      unchanged: 'unchanged',
    };
    if (typeof oldValue === 'undefined') {
      return {
        property,
        value: newValue,
        subproperties: [],
        state: states.added,
      };
    }
    if (typeof newValue === 'undefined') {
      return {
        property,
        value: oldValue,
        subproperties: [],
        state: states.deleted,
      };
    }
    if (_.isEqual(oldValue, newValue)) {
      return {
        property,
        value: oldValue,
        subproperties: [],
        state: states.unchanged,
      };
    }
    const hasSubproperties = oldValue instanceof Object && newValue instanceof Object;
    return {
      property,
      value: { oldValue, newValue },
      subproperties: hasSubproperties ? genDiff(oldValue, newValue) : [],
      state: states.changed,
    };
  };
  const properties = _.union(_.keys(beforeConfig), _.keys(afterConfig));
  const diff = properties.reduce(
    (acc, property) => {
      const [oldValue, newValue] = [beforeConfig[property], afterConfig[property]];
      return [...acc, build(property, oldValue, newValue)];
    },
    [],
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
