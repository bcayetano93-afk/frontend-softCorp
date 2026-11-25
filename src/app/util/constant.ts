export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export class RegexConstants {
  static number(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  static name(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '');
  }

  static text(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    input.value = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,:/()#]/g, '');
  }

  static address(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,.#/]/g, '');
  }

  static email(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\w@.\-+]/g, '');
  }

  static username(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z0-9._-]/g, '');
  }

  static codigoEquipo(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
  }

  static rolCodigo(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z_]/g, '');
  }
}

export const PATTERNS = {
  username: /^[a-zA-Z0-9._-]{3,50}$/,
  codigoEquipo: /^[A-Z0-9]{2,8}(-[A-Z0-9]{1,8}){1,3}$/,
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,150}$/,
  textoGeneral: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,:/()#]{3,300}$/,
};

export function onEnterKey(event: Event): void {
  const target = event.target as HTMLElement | null;
  if (!target || target.tagName === 'TEXTAREA') {
    return;
  }
  event.preventDefault();
  const form = (target as HTMLInputElement).form;
  if (!form) {
    return;
  }
  const elements = Array.from(form.elements).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && !(el as HTMLButtonElement).disabled && el.tabIndex !== -1,
  );
  const index = elements.indexOf(target);
  if (index >= 0 && index + 1 < elements.length) {
    elements[index + 1].focus();
  }
}
