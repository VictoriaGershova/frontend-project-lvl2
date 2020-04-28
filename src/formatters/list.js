import { flatten } from 'lodash';
import states from '../state';

const tabLength = 4;

const stringifyValue = (value, depth) => {
  if (!(value instanceof Object)) {
    return `${value}`;
  }
  const lines = Object.keys(value).map(
    (key) => (
      `${' '.repeat(tabLength * (depth + 1))}${key}: ${stringifyValue(value[key], depth + 1)}`
    ),
  );
  return ['{', ...lines, `${' '.repeat(depth * tabLength)}}`].join('\n');
};

export default (diff) => {
  const formatDiff = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
    const lines = diffItems.map((propertyDiff) => {
      const {
        property,
        value,
        oldValue,
        newValue,
      } = propertyDiff;
      switch (propertyDiff.state) {
        case states.added:
          return `${'+ '.padStart(margeWidth, ' ')}${property}: ${stringifyValue(value, depth + 1)}`;
        case states.deleted:
          return `${'- '.padStart(margeWidth, ' ')}${property}: ${stringifyValue(value, depth + 1)}`;
        case states.changed:
          return [
            `${'- '.padStart(margeWidth, ' ')}${property}: ${stringifyValue(oldValue, depth + 1)}`,
            `${'+ '.padStart(margeWidth, ' ')}${property}: ${stringifyValue(newValue, depth + 1)}`,
          ];
        case states.innerChanged:
          return `${'  '.padStart(margeWidth, ' ')}${property}: ${formatDiff(propertyDiff.children, depth + 1)}`;
        case states.unchanged:
          return `${'  '.padStart(margeWidth, ' ')}${property}: ${stringifyValue(value, depth + 1)}`;
        default:
          throw new Error(`Unknown property state: '${propertyDiff.state}'!`);
      }
    });
    return ['{', ...flatten(lines), `${' '.repeat(tabLength * depth)}}`].join('\n');
  };
  const lines = formatDiff(diff);
  return lines;
};
