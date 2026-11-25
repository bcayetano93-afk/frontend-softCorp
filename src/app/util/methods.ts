import { ClassGeneric } from './class-generic';

export function setListRow<T extends object>(list: T[] | null | undefined): (T & ClassGeneric)[] {
  if (!list) {
    return [];
  }
  return list.map((item, index) => ({
    ...item,
    row: index + 1,
  }));
}
