import { ClassGeneric } from '../util/class-generic';

export interface RolRequest {
  idRol?: number;
  codigo: string;
  descripcion: string;
}

export interface RolResponse extends ClassGeneric {
  idRol: number;
  codigo: string;
  descripcion: string;
}

export interface ModuloRequest {
  idMod?: number;
  descripcion?: string;
  url?: string;
  activo?: string;
  ordenOpcion?: number;
}

export interface ModuloResponse extends ClassGeneric {
  idMod: number;
  descripcion: string;
  url: string;
  activo: string;
  ordenOpcion: number;
}
