import { setListRow } from './methods';

describe('setListRow', () => {
  it('should return an empty array when input is null or undefined', () => {
    expect(setListRow(null)).toEqual([]);
    expect(setListRow(undefined)).toEqual([]);
  });

  it('should append 1-based row numbers without mutating original items', () => {
    const items = [{ id: 10, nombre: 'Uno' }, { id: 20, nombre: 'Dos' }];
    const result = setListRow(items);

    expect(result).toEqual([
      { id: 10, nombre: 'Uno', row: 1 },
      { id: 20, nombre: 'Dos', row: 2 },
    ]);
    expect((items[0] as { row?: number }).row).toBeUndefined();
  });
});
