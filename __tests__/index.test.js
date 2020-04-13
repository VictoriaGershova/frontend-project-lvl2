import path from 'path';
import fs from 'fs';
import gendiff from '../src';

const inFormats = [
  'json',
  'yml',
  'ini',
];

const outFormats = {
  list: 'listresult.txt',
  plain: 'plainresult.txt',
  json: 'jsonresult.json',
};

const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

describe('exceptions', () => {
  test('invalid JSON file', () => {
    const correctFilePath = getFixturePath('after.json');
    const notValidFilePath = getFixturePath('invalid.json');
    expect(() => gendiff(notValidFilePath, correctFilePath, 'list')).toThrow();
  });
  test('empty arguments', () => {
    expect(() => gendiff()).toThrow();
  });
  test('invalid file name', () => {
    const correctFilePath = getFixturePath('after.json');
    expect(() => gendiff('../nonexistent.json', correctFilePath, 'list')).toThrow();
    expect(() => gendiff('../src', correctFilePath, 'list')).toThrow();
  });
  test('invalid output format name', () => {
    const beforeFilePath = getFixturePath('before.json');
    const afterFilePath = getFixturePath('after.json');
    expect(() => gendiff(beforeFilePath, afterFilePath, '')).toThrow();
    expect(() => gendiff(beforeFilePath, afterFilePath)).toThrow();
  });
});

describe.each(inFormats)('%s', (inFormat) => {
  test.each(Object.keys(outFormats))('%s', async (outFormat) => {
    const beforeFilePath = getFixturePath(`before.${inFormat}`);
    const afterFilePath = getFixturePath(`after.${inFormat}`);
    const actual = await gendiff(beforeFilePath, afterFilePath, outFormat);
    const expected = await fs.readFileSync(getFixturePath(outFormats[outFormat]), 'utf-8').trim();
    expect(actual).toEqual(expected);
  });
});
