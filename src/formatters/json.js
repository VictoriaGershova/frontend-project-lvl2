import {
  getName,
  getValue,
  isAdded,
  isChanged,
  isDeleted,
  hasSubproperties,
  getSubproperties,
} from '../propertydiff';

export default (diff, sortDiff) => {
  const formatDiff = (diffItems) => {
    const sorted = sortDiff(diffItems);
    const lines = sorted.reduce(
      (acc, propDiff) => {
        const property = getName(propDiff);
        if (hasSubproperties(propDiff)) {
          return { ...acc, [property]: formatDiff(getSubproperties(propDiff)) };
        }
        const value = getValue(propDiff);
        let state = 'unchanged';
        if (isAdded(propDiff)) {
          state = 'added';
        }
        if (isDeleted(propDiff)) {
          state = 'deleted';
        }
        if (isChanged(propDiff)) {
          state = 'changed';
        }
        return { ...acc, [property]: { state, value } };
      },
      {},
    );
    return lines;
  };
  const lines = formatDiff(diff);
  const result = JSON.stringify(lines, null, 2);
  return result;
};
