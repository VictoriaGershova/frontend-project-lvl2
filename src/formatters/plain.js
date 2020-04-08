import {
  getName,
  getValue,
  isAdded,
  isChanged,
  isDeleted,
  hasSubproperties,
  getSubproperties,
} from '../propertydiff';

const stringifyValue = (value) => {
  switch (typeof value) {
    case 'object':
      return '[complex value]';
    case 'string':
      return `'${value}'`;
    default:
      return value;
  }
};

export default (diff, sortDiff) => {
  const formatDiff = (diffItems, parentProperty = '') => {
    const sorted = sortDiff(diffItems);
    const lines = sorted.reduce(
      (acc, propDiff) => {
        const property = getName(propDiff);
        const value = getValue(propDiff);
        const propertyName = (parentProperty === '' ? property : `${parentProperty}.${property}`);
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        if (isAdded(propDiff)) {
          return [...acc, lineTemplate(`added with value: ${stringifyValue(value)}`)];
        }
        if (isDeleted(propDiff)) {
          return [...acc, lineTemplate('deleted')];
        }
        if (hasSubproperties(propDiff)) {
          return [...acc, ...formatDiff(getSubproperties(propDiff), propertyName)];
        }
        if (isChanged(propDiff)) {
          return [...acc, lineTemplate(
            `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
          )];
        }
        return acc;
      },
      [],
    );
    return lines;
  };
  const lines = formatDiff(diff);
  return lines.join('\n');
};
