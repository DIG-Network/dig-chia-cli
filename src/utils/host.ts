// Helper function to wrap IPv6 addresses in brackets
export const formatHost = (host: string): string => {
    const ipv6Pattern = /^[a-fA-F0-9:]+$/; // Simple regex to match raw IPv6 addresses (without brackets)
    const hasBrackets = /^\[.*\]$/; // Regex to check if the address already has brackets
  
    // If it's an IPv6 address without brackets, add them
    if (ipv6Pattern.test(host) && !hasBrackets.test(host)) {
      return `[${host}]`;
    }
  
    return host; // Return the host as is (IPv4, hostname, or already bracketed IPv6)
  };
  