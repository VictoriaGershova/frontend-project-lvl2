import _ from 'lodash';

export default (property, oldValue, newValue) => (message) => {
  switch (message) {
    case 'oldValue':
      return oldValue;
    case 'newValue':
      return newValue;
    default:
      return property;
  }
};

const getOldValue = (propertyDiff) => {
  if (propertyDiff instanceof Array) {
    return propertyDiff[0]('oldValue');
  }
  return propertyDiff('oldValue');
};

const getNewValue = (propertyDiff) => {
  if (propertyDiff instanceof Array) {
    return propertyDiff[0]('newValue');
  }
  return propertyDiff('newValue');
};

export const getName = (propertyDiff) => {
  if (propertyDiff instanceof Array) {
    return propertyDiff[0]();
  }
  return propertyDiff();
};

export const isAdded = (propertyDiff) => typeof getOldValue(propertyDiff) === 'undefined';

export const isDeleted = (propertyDiff) => typeof getNewValue(propertyDiff) === 'undefined';

export const isChanged = (propertyDiff) => {
  const oldValue = getOldValue(propertyDiff);
  const newValue = getNewValue(propertyDiff);
  return typeof oldValue !== 'undefined'
    && typeof newValue !== 'undefined'
    && !_.isEqual(getOldValue(propertyDiff), getNewValue(propertyDiff));
};

export const getValue = (propertyDiff) => {
  const oldValue = getOldValue(propertyDiff);
  const newValue = getNewValue(propertyDiff);
  if (isAdded(propertyDiff)) {
    return newValue;
  }
  if (isChanged(propertyDiff)) {
    return { oldValue, newValue };
  }
  return oldValue;
};

export const hasSubproperties = (propertyDiff) => propertyDiff instanceof Array;

export const getSubproperties = ([, subproperties]) => subproperties;

export const addSubproperties = (propertyDiff, subproperties) => [propertyDiff, subproperties];
