/**
 * Utility functions for masking sensitive data (Email & Phone Number)
 */

export function maskEmail(email: string, isMasked: boolean): string {
  if (!isMasked || !email) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '••••••••';
  const name = parts[0];
  const domain = parts[1];
  
  if (name.length <= 2) {
    return `**@${domain}`;
  }
  
  const maskedName = name[0] + '*'.repeat(Math.min(6, name.length - 2)) + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone: string, isMasked: boolean): string {
  if (!isMasked || !phone) return phone;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 5) return '••••••••';
  
  // E.g. 08123456789 -> 0812****789
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-3);
  return `${prefix}****${suffix}`;
}
