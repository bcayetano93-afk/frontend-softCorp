import { ClassGeneric } from './class-generic';

// Numera correlativamente las filas (row: 1..N) para mostrar índices en tablas paginadas
export function setListRow<T extends object>(list: T[] | null | undefined): (T & ClassGeneric)[] {
  if (!list) {
    return [];
  }
  return list.map((item, index) => ({
    ...item,
    row: index + 1,
  }));
}
