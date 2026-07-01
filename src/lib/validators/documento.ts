/**
 * Validação de CPF e CNPJ (dígitos verificadores oficiais).
 * Todas as funções trabalham apenas com os dígitos (ignoram máscara).
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais

  const calcCheck = (base: string, factor: number): number => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor--;
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcCheck(cpf.slice(0, 9), 10);
  if (d1 !== Number(cpf[9])) return false;
  const d2 = calcCheck(cpf.slice(0, 10), 11);
  return d2 === Number(cpf[10]);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheck = (base: string): number => {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * weights[i];
    }
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcCheck(cnpj.slice(0, 12));
  if (d1 !== Number(cnpj[12])) return false;
  const d2 = calcCheck(cnpj.slice(0, 13));
  return d2 === Number(cnpj[13]);
}

/** Valida CPF (11 dígitos) ou CNPJ (14 dígitos). */
export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}
