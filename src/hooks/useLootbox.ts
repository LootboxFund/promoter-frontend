import { Address } from '@wormgraph/helpers';
import LootboxABI from '@wormgraph/helpers/lib/abi/LootboxCosmic.json';
import { Contract, ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

interface UseLootboxProps {
  address: Address;
}

interface UseLootboxResult {
  lootbox: Contract | null;
  depositNative: (amount: ethers.BigNumber) => Promise<ethers.ContractTransaction>;
  depositERC20: (
    amount: ethers.BigNumber,
    tokenAddress: Address,
  ) => Promise<ethers.ContractTransaction>;
}

export const useLootbox = ({ address }: UseLootboxProps): UseLootboxResult => {
  const { library } = useWeb3();
  const lootbox = address ? new Contract(address, LootboxABI, library?.getSigner()) : null;

  const depositNative = async (amount: ethers.BigNumber) => {
    if (!lootbox) {
      throw new Error('Connect MetaMask');
    }
    return lootbox.depositEarningsNative({
      value: amount,
    }) as Promise<ethers.ContractTransaction>;
  };

  const depositERC20 = async (amount: ethers.BigNumber, tokenAddress: Address) => {
    if (!lootbox) {
      throw new Error('Connect MetaMask');
    }
    return lootbox.depositEarningsErc20(
      tokenAddress,
      amount,
    ) as Promise<ethers.ContractTransaction>;
  };

  return { lootbox, depositNative, depositERC20 };
};
