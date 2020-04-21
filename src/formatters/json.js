export default (diff) => {
  const line = { properties: diff };
  const result = JSON.stringify(line, null, 2);
  return result;
};
