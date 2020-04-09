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
    const correctFile = getFixturePath('after.json');
    const notValidFile = getFixturePath('invalid.json');
    expect(() => gendiff(notValidFile, correctFile, 'list')).toThrow();
  });
  test('empty arguments', () => {
    expect(() => gendiff()).toThrow();
  });
  test('invalid file name', () => {
    const correctFile = getFixturePath('after.json');
    expect(() => gendiff('../nonexistent.json', correctFile, 'list')).toThrow();
    expect(() => gendiff('../src', correctFile, 'list')).toThrow();
  });
  test('invalid output format name', () => {
    const pathBefore = getFixturePath('before.json');
    const pathAfter = getFixturePath('after.json');
    expect(() => gendiff(pathBefore, pathAfter, '')).toThrow();
    expect(() => gendiff(pathBefore, pathAfter)).toThrow();
  });
});

describe.each(inFormats)('%s', (inFormat) => {
  test.each(Object.keys(outFormats))('%s', async (outFormat) => {
    const pathBefore = getFixturePath(`before.${inFormat}`);
    const pathAfter = getFixturePath(`after.${inFormat}`);
    const actual = await gendiff(pathBefore, pathAfter, outFormat);
    const expected = await fs.readFileSync(getFixturePath(outFormats[outFormat]), 'utf-8').trim();
    expect(actual).toEqual(expected);
  });
});
