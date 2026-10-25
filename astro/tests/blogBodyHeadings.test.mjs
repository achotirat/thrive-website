import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBodyHeadings } from '../src/lib/blogBodyHeadings.mjs';

test('drops a body h1 that repeats the post title', () => {
  assert.equal(normalizeBodyHeadings('<h1>จิตบำบัด CBT  คืออะไร</h1><p>a</p>', 'จิตบำบัด CBT คืออะไร'), '<p>a</p>');
});

test('demotes other body h1 headings to h2, keeping attributes', () => {
  assert.equal(normalizeBodyHeadings('<h1 id="x">Other</h1>', 'Title'), '<h2 id="x">Other</h2>');
});

test('leaves bodies without h1 unchanged', () => {
  assert.equal(normalizeBodyHeadings('<h2>A</h2><p>b</p>', 'Title'), '<h2>A</h2><p>b</p>');
  assert.equal(normalizeBodyHeadings('', 'Title'), '');
});
