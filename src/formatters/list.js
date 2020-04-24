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
      const lineTemplate = (stateSign, content) => (
        `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${content}`
      );
      switch (propertyDiff.state) {
        case states.added:
          return lineTemplate('+', stringifyValue(value, depth + 1));
        case states.deleted:
          return lineTemplate('-', stringifyValue(value, depth + 1));
        case states.changed:
          return [
            lineTemplate('-', stringifyValue(oldValue, depth + 1)),
            lineTemplate('+', stringifyValue(newValue, depth + 1)),
          ];
        case states.innerChanged:
          return lineTemplate(' ', formatDiff(propertyDiff.children, depth + 1));
        default:
          return lineTemplate(' ', stringifyValue(value, depth + 1));
      }
    });
    return ['{', ...flatten(lines), `${' '.repeat(tabLength * depth)}}`].join('\n');
  };
  const lines = formatDiff(diff);
  return lines;
};
