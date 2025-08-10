export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatShortDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};

export const validateMatricule = (matricule: string): boolean => {
  return /^\d{7}$/.test(matricule.trim());
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateIP = (ip: string): boolean => {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  return ipRegex.test(ip);
};

export const getStatusColor = (statut: string): string => {
  switch (statut) {
    case 'en_ligne': return '#10b981';
    case 'hors_ligne': return '#dc2626';
    case 'maintenance': return '#f59e0b';
    case 'en_cours': return '#f59e0b';
    case 'clos': return '#10b981';
    case 'resolu': return '#10b981';
    case 'en_garde_a_vue': return '#dc2626';
    case 'libere': return '#10b981';
    case 'transfere': return '#f59e0b';
    default: return '#64748b';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
};