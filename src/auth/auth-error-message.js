export function getAuthFailureMessage(status, payload) {
  if (payload && typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  const code = Number.isInteger(status) && status >= 100 && status <= 599
    ? status
    : null;

  if (code === null) {
    return 'A API respondeu de forma inesperada. Tente novamente.';
  }

  return `A API respondeu com HTTP ${code}, mas não concluiu a autenticação. Informe este código ao suporte.`;
}
