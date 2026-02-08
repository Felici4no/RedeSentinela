export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate();
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${day} de ${month} às ${hours}:${minutes}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate();
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();

  return `${day} de ${month} de ${year}`;
}
