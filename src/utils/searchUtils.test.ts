import { describe, it, expect } from 'vitest';
import { searchStringField, searchArrayField } from './searchUtils';

describe('searchStringField', () => {
  it('should support partial matches', () => {
    expect(searchStringField('test', 'this is a test string')).toBe(true);
    expect(searchStringField('world', 'hello world')).toBe(true);
    expect(searchStringField('notfound', 'some text here')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(searchStringField('TEST', 'this is a test string')).toBe(true);
    expect(searchStringField('test', 'THIS IS A TEST STRING')).toBe(true);
    expect(searchStringField('TeSt', 'This Is A TeSt String')).toBe(true);
  });
});

describe('searchArrayField', () => {
  it('should support partial matches', () => {
    expect(searchArrayField('test', ['hello', 'testing', 'world'])).toBe(true);
    expect(searchArrayField('wor', ['hello', 'world', 'test'])).toBe(true);
    expect(searchArrayField('notfound', ['hello', 'world', 'test'])).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(searchArrayField('TEST', ['hello', 'testing', 'world'])).toBe(true);
    expect(searchArrayField('test', ['HELLO', 'TESTING', 'WORLD'])).toBe(true);
    expect(searchArrayField('WoRlD', ['hello', 'world', 'test'])).toBe(true);
  });
});
