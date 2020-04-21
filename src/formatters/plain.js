import states from '../state';
import types from '../type';

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
        const { property, oldValue, newValue } = propertyDiff;
        const propertyName = parentProperty === '' ? property : `${parentProperty}.${property}`;
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        if (propertyDiff.type === types.tree) {
          return formatDiff(propertyDiff.children, propertyName);
        }
        switch (propertyDiff.state) {
          case states.added:
            return lineTemplate(`added with value: ${stringifyValue(newValue)}`);
          case states.deleted:
            return lineTemplate('deleted');
          case states.changed:
            return lineTemplate(
              `changed from ${stringifyValue(oldValue)} to ${stringifyValue(newValue)}`,
            );
          default:
            return '';
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
