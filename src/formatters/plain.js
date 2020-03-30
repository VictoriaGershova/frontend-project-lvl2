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
  const serializeDiffItems = (diffItems, parentProperty = '') => {
    const properties = sortProp(Object.keys(diffItems));
    const lines = properties.reduce(
      (acc, property) => {
        const { value, children, operation } = diffItems[property];
        const propertyName = (parentProperty === '' ? property : `${parentProperty}.${property}`);
        let newLines = [];
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        if (operation === 'insert') {
          newLines = [lineTemplate(`added with value: ${stringifyValue(value)}`)];
        }
        if (operation === 'delete') {
          newLines = [lineTemplate('deleted')];
        }
        if (Object.keys(children).length > 0) {
          newLines = serializeDiffItems(children, propertyName);
        } else if (operation === 'update') {
          newLines = [lineTemplate(
            `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
          )];
        }
        return [...acc, ...newLines];
      },
      [],
    );
    return lines;
  };
  const lines = serializeDiffItems(diff);
  return lines.join('\n');
};
