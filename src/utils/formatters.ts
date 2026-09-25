// Pakistani currency, CNIC, and date formatting utilities

export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'PKR 0';
  return 'PKR ' + amount.toLocaleString('en-PK');
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatCNIC(val: string): string {
  // Format as XXXXX-XXXXXXX-X
  const cleaned = val.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
}

export function getGradeBadge(grade: string): { text: string; color: string } {
  switch (grade) {
    case 'A+':
    case 'A-1':
      return { text: 'A+ (Exceptional)', color: 'text-emerald-700 bg-emerald-50' };
    case 'A':
      return { text: 'A (Excellent)', color: 'text-green-700 bg-green-50' };
    case 'B':
      return { text: 'B (Very Good)', color: 'text-blue-700 bg-blue-50' };
    case 'C':
      return { text: 'C (Good)', color: 'text-amber-700 bg-amber-50' };
    case 'D':
      return { text: 'D (Fair)', color: 'text-orange-700 bg-orange-50' };
    case 'E':
      return { text: 'E (Satisfactory)', color: 'text-yellow-700 bg-yellow-50' };
    case 'F':
    default:
      return { text: 'F (Fail)', color: 'text-rose-700 bg-rose-50' };
  }
}
