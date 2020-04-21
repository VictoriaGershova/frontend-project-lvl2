import { flatten } from 'lodash';
import states from '../state';
import types from '../type';

const tabLength = 4;

const stringifyObject = (obj, depth) => {
  const marge = tabLength * (depth + 1);
  const lines = Object.keys(obj)
    .map((key) => {
      const v = obj[key];
      const strV = v instanceof Object ? stringifyObject(v, depth + 1) : v;
      return `${' '.repeat(marge)}${key}: ${strV}`;
    });
  return ['{', ...lines, `${' '.repeat(depth * tabLength)}}`].join('\n');
};

const stringifyValue = (value, depth) => {
  if (value instanceof Object) {
    return stringifyObject(value, depth);
  }
  return `${value}`;
};

export default (diff) => {
  const formatDiff = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
    const lines = diffItems.map((propertyDiff) => {
      const { property, oldValue, newValue } = propertyDiff;
      const lineTemplate = (stateSign, content) => (
        `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${content}`
      );
      if (propertyDiff.type === types.tree) {
        return lineTemplate(' ', formatDiff(propertyDiff.children, depth + 1));
      }
      switch (propertyDiff.state) {
        case states.added:
          return lineTemplate('+', stringifyValue(newValue, depth + 1));
        case states.deleted:
          return lineTemplate('-', stringifyValue(oldValue, depth + 1));
        case states.changed:
          return [
            lineTemplate('-', stringifyValue(oldValue, depth + 1)),
            lineTemplate('+', stringifyValue(newValue, depth + 1)),
          ];
        default:
          return lineTemplate(' ', stringifyValue(oldValue, depth + 1));
      }
    });
    return ['{', ...flatten(lines), `${' '.repeat(tabLength * depth)}}`].join('\n');
  };
  const lines = formatDiff(diff);
  return lines;
};
