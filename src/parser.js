import yaml from 'js-yaml';

const parserFunctions = {
  json: JSON.parse,
  yml: yaml.safeLoad,
};

export default (extName) => (data = {}) => parserFunctions[extName](data);
