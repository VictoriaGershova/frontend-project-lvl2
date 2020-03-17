import yaml from 'js-yaml';
import ini from 'ini';

const parserFunctions = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: ini.parse,
};

export default (extName) => (data = {}) => parserFunctions[extName](data);
