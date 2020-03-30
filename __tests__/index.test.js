import path from 'path';
import fs from 'fs';
import gendiff from '../src';

const inFormats = [
  'json',
  'yml',
  'ini',
];

const outFormats = {
  default: 'defaultresult.txt',
  plain: 'plainresult.txt',
  json: 'jsonresult.json',
};

const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

test('exceptions', () => {
  const correct = getFixturePath('second.json');
  expect(() => gendiff()).toThrow();
  expect(() => gendiff('../nonexistent.json', correct)).toThrow();
  expect(() => gendiff('../src', correct)).toThrow();
});

test('empty file', async () => {
  const pathFile = getFixturePath('empty.yml');
  const actual = await gendiff(pathFile, pathFile);
  const expected = '{\n}';
  expect(actual).toEqual(expected);
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
