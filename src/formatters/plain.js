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

export default (diff) => {
  const serializeDiffItems = (diffItems, parentProperty = '') => {
    const properties = Object.keys(diffItems);
    const lines = properties
      .sort((propertyA, propertyB) => {
        if (propertyA < propertyB) {
          return -1;
        }
        if (propertyA > propertyB) {
          return 1;
        }
        return 0;
      })
      .reduce(
        (acc, property) => {
          const { value, children, operation } = diffItems[property];
          const propertyName = (parentProperty === '' ? property : `${parentProperty}.${property}`);
          const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
          if (operation === 'insert') {
            return [...acc, lineTemplate(`added with value: ${stringifyValue(value)}`)];
          }
          if (operation === 'delete') {
            return [...acc, lineTemplate('deleted')];
          }
          if (operation === 'unchanged') {
            return acc;
          }
          if (Object.keys(children).length > 0) {
            return [...acc, ...serializeDiffItems(children, propertyName)];
          }
          return [
            ...acc,
            lineTemplate(
              `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
            ),
          ];
        },
        [],
      );
    return lines;
  };
  const lines = serializeDiffItems(diff);
  return lines.join('\n');
};
