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

export default (diff, sortProp) => {
  const formatDiffItems = (diffItems, parentProperty = '') => {
    const sorted = sortProp(diffItems);
    const lines = sorted.reduce(
      (acc, diffItem) => {
        const {
          property,
          value,
          subproperties,
          state,
        } = diffItem;
        const propertyName = (parentProperty === '' ? property : `${parentProperty}.${property}`);
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        if (state === 'unchanged') {
          return acc;
        }
        if (state === 'added') {
          return [...acc, lineTemplate(`added with value: ${stringifyValue(value)}`)];
        }
        if (state === 'deleted') {
          return [...acc, lineTemplate('deleted')];
        }
        if (subproperties.length > 0) {
          return [...acc, ...formatDiffItems(subproperties, propertyName)];
        }
        return [...acc, lineTemplate(
          `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
        )];
      },
      [],
    );
    return lines;
  };
  const lines = formatDiffItems(diff);
  return lines.join('\n');
};
