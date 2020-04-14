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
    const lines = diffItems.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          value,
          hasInnerChange,
          children,
          state,
        } = propertyDiff();
        const propertyName = parentProperty === '' ? property : `${parentProperty}.${property}`;
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        switch (state) {
          case states.added:
            return [...acc, lineTemplate(`added with value: ${stringifyValue(value)}`)];
          case states.deleted:
            return [...acc, lineTemplate('deleted')];
          case states.changed:
            if (hasInnerChange) {
              return [...acc, ...formatDiff(children, propertyName)];
            }
            return [...acc, lineTemplate(
              `changed from ${stringifyValue(value.oldValue)} to ${stringifyValue(value.newValue)}`,
            )];
          default:
            return acc;
        }
      },
      [],
    );
    return lines;
  };
  const lines = formatDiff(diff);
  return lines.join('\n');
};
