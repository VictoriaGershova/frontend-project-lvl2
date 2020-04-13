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

export default (diff, sortDiff) => {
  const formatDiff = (diffItems, parentProperty = '') => {
    const sorted = sortDiff(diffItems);
    const lines = sorted.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          value,
          children,
          state,
        } = propertyDiff();
        const propertyName = parentProperty === '' ? property : `${parentProperty}.${property}`;
        const lineTemplate = (action) => `Property '${propertyName}' was ${action}`;
        if (state === states.added) {
          return [...acc, lineTemplate(`added with value: ${stringifyValue(value)}`)];
        }
        if (state === states.deleted) {
          return [...acc, lineTemplate('deleted')];
        }
        if (children) {
          return [...acc, ...formatDiff(children, propertyName)];
        }
        if (state === states.changed) {
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
