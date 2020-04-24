import states from '../state';

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
  const formatDiff = (diffItems, parentProperty = '') => {
    const lines = diffItems.map(
      (propertyDiff) => {
        const {
          property,
          value,
          oldValue,
          newValue,
        } = propertyDiff;
        const fullPropertyName = parentProperty === '' ? property : `${parentProperty}.${property}`;
        const lineTemplate = (action) => `Property '${fullPropertyName}' was ${action}`;
        switch (propertyDiff.state) {
          case states.added:
            return lineTemplate(`added with value: ${stringifyValue(value)}`);
          case states.deleted:
            return lineTemplate('deleted');
          case states.changed:
            return lineTemplate(
              `changed from ${stringifyValue(oldValue)} to ${stringifyValue(newValue)}`,
            );
          case states.unchanged:
            return '';
          case states.innerChanged:
            return formatDiff(propertyDiff.children, fullPropertyName);
          default:
            throw new Error(`Unknown property state: '${propertyDiff.state}'!`);
        }
      },
      [],
    );
    return lines
      .filter((line) => line !== '')
      .join('\n');
  };
  const lines = formatDiff(diff);
  return lines;
};
