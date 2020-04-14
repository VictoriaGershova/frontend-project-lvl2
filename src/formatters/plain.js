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
          state,
          value,
          hasInnerChanges,
          children,
        } = propertyDiff();
        const propertyName = parentProperty === '' ? property : `${parentProperty}.${property}`;
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        switch (state) {
          case states.added:
            return lineTemplate(`added with value: ${stringifyValue(value)}`);
          case states.deleted:
            return lineTemplate('deleted');
          case states.changed:
            if (hasInnerChanges) {
              return formatDiff(children, propertyName);
            }
            return lineTemplate(
              `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
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
