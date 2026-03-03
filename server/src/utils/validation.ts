export function validatePakistanMobile(mobile: string): boolean {
  const regex = /^3[0-9]{9}$/;
  return regex.test(mobile);
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateCNIC(cnic: string): boolean {
  const regex = /^[0-9]{13}$/;
  return regex.test(cnic.replace(/-/g, ''));
}

export function formatMobileNumber(mobile: string, countryCode: string = '+92'): string {
  const cleanMobile = mobile.replace(/\D/g, '');
  
  if (cleanMobile.startsWith('92')) {
    return '+' + cleanMobile;
  }
  
  if (cleanMobile.startsWith('0')) {
    return countryCode + cleanMobile.substring(1);
  }
  
  return countryCode + cleanMobile;
}
