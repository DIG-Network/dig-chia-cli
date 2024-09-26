// Helper function to wrap IPv6 addresses in brackets
export const formatHost = (host: string): string => {
  const ipv6Pattern = /^[a-fA-F0-9:]+$/; // Simple regex to match IPv6 addresses
  if (ipv6Pattern.test(host)) {
    return `[${host}]`; // Wrap IPv6 in brackets
  }
  return host;
};
