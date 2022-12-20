import { getAddress } from '@ethersproject/address';

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export const shortenAddress = (address: string, characters = 4): string => {
  try {
    const parsed = getAddress(address);
    return `${parsed.substring(0, characters + 2)}...${parsed.substring(42 - characters)}`;
  } catch (error) {
    // throw `Invalid 'address' parameter '${address}'.`;
    return address;
  }
};

export const isValidEVMAddress = (address: string): boolean => {
  // Check if the address is a string
  if (typeof address !== 'string') {
    return false;
  }

  // Check if the address is 42 characters long
  if (address.length !== 42) {
    return false;
  }

  // Check if the address starts with '0x'
  if (!address.startsWith('0x') && !address.startsWith('ronin')) {
    return false;
  }

  // Check if the address contains only hexadecimal characters
  if (/[^0-9A-Fa-f]/.test(address.slice(2))) {
    return false;
  }

  return true;
};
