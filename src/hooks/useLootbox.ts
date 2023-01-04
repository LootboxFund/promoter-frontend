import { chainIdToHex } from '@/lib/chain';
import { promiseChain } from '@/lib/promise';
import { Address, BLOCKCHAINS, ChainIDHex, chainIdHexToSlug, DepositID } from '@wormgraph/helpers';
import LootboxABI from '@wormgraph/helpers/lib/abi/LootboxCosmic.json';
import { Contract, ContractTransaction, ethers } from 'ethers';
import useERC20 from './useERC20';
import useReadOnlyProvider from './useReadOnlyProvider';
import { useWeb3 } from './useWeb3';

interface UseLootboxProps {
  address?: Address;
  chainIDHex?: ChainIDHex;
}

export interface DepositWeb3Fragment {
  tokenAddress: Address;
  tokenAmount: string;
}

export interface DepositWeb3 extends DepositWeb3Fragment {
  tokenSymbol: string;
  decimal: string;
}

export interface Deposit {
  id: DepositID | string;
  title: string;
  quantity: string;
  type: DepositTypeFE;
  date: string;
  tokenAddress?: Address;
}
export enum DepositTypeFE {
  Voucher = 'Voucher',
  Native = 'Native',
  Token = 'Token',
}

interface UseLootboxResult {
  lootbox: Contract | null;
  depositNative: (amount: ethers.BigNumber) => Promise<ethers.ContractTransaction>;
  depositERC20: (
    amount: ethers.BigNumber,
    tokenAddress: Address,
  ) => Promise<ethers.ContractTransaction>;
  changeMaxTickets: (maxTickets: number) => Promise<ethers.ContractTransaction>;
  getLootboxDeposits: () => Promise<DepositWeb3[]>;
  flushTokens: (targetFlushAddress?: Address) => Promise<ethers.ContractTransaction>;
}

export const useLootbox = ({ address, chainIDHex }: UseLootboxProps): UseLootboxResult => {
  const { currentAccount, library, network } = useWeb3();
  const { provider } = useReadOnlyProvider({ chainIDHex });
  const { getDecimals, getSymbol } = useERC20({ chainIDHex });
  const lootbox = address ? new Contract(address, LootboxABI, provider || undefined) : null;
  const chainSlug = chainIDHex ? chainIdHexToSlug(chainIDHex) : null;
  const chain = chainSlug ? BLOCKCHAINS[chainSlug] : null;

  const depositNative = async (amount: ethers.BigNumber): Promise<ContractTransaction> => {
    const signer = library?.getSigner(currentAccount);
    if (!lootbox || !signer || !network?.chainId) {
      throw new Error('Connect MetaMask');
    }

    const connectedChainIDHex = chainIdToHex(network.chainId);
    if (chainIDHex && connectedChainIDHex && connectedChainIDHex !== chainIDHex) {
      throw new Error(`Wrong network, please connect ${chainIDHex}`);
    }

    return lootbox.connect(signer).depositEarningsNative({
      value: amount,
    }) as Promise<ethers.ContractTransaction>;
  };

  const depositERC20 = async (
    amount: ethers.BigNumber,
    tokenAddress: Address,
  ): Promise<ContractTransaction> => {
    const signer = library?.getSigner(currentAccount);
    if (!lootbox || !signer || !network?.chainId) {
      throw new Error('Connect MetaMask');
    }

    const connectedChainIDHex = chainIdToHex(network.chainId);
    if (chainIDHex && connectedChainIDHex && connectedChainIDHex !== chainIDHex) {
      throw new Error(`Wrong network, please connect ${chainIDHex}`);
    }

    return lootbox
      .connect(signer)
      .depositEarningsErc20(tokenAddress, amount.toString()) as Promise<ethers.ContractTransaction>;
  };

  const changeMaxTickets = async (maxTickets: number): Promise<ContractTransaction> => {
    const signer = library?.getSigner(currentAccount);
    if (!lootbox || !signer || !network?.chainId) {
      throw new Error('Connect MetaMask');
    }

    const connectedChainIDHex = chainIdToHex(network.chainId);
    if (chainIDHex && connectedChainIDHex && connectedChainIDHex !== chainIDHex) {
      throw new Error(`Wrong network, please connect ${chainIDHex}`);
    }

    return lootbox
      .connect(signer)
      .changeMaxTickets(maxTickets) as Promise<ethers.ContractTransaction>;
  };

  const getLootboxDeposits = async (): Promise<DepositWeb3[]> => {
    if (!lootbox) {
      return [];
    }

    const erc20Mapping: { [key: Address]: { symbol: string; decimals: string } } = {};

    const convertDepositFragmentToDeposit = async (fragment: DepositWeb3Fragment) => {
      let symbol: string;
      let decimal: string;
      if (erc20Mapping[fragment.tokenAddress]) {
        symbol = erc20Mapping[fragment.tokenAddress].symbol;
        decimal = erc20Mapping[fragment.tokenAddress].decimals;
      } else {
        if (fragment.tokenAddress === ethers.constants.AddressZero) {
          symbol = chain?.nativeCurrency.symbol || 'ETH';
          decimal = `${chain?.nativeCurrency.decimals}` || '18';
        } else {
          try {
            symbol = await getSymbol(fragment.tokenAddress);
          } catch (err) {
            symbol = fragment.tokenAddress?.slice(0, 4) + '...' || '';
          }
          try {
            const decimalBN = await getDecimals(fragment.tokenAddress);
            decimal = decimalBN.toString();
          } catch (err) {
            decimal = '18';
          }
        }
      }
      return {
        tokenSymbol: symbol,
        tokenAmount: fragment.tokenAmount,
        tokenAddress: fragment.tokenAddress,
        decimal: decimal,
      };
    };
    try {
      const deposits = await lootbox.viewAllDeposits();

      const res: DepositWeb3Fragment[] = [];

      for (const deposit of deposits) {
        if (deposit?.nativeTokenAmount && deposit?.nativeTokenAmount?.gt('0')) {
          res.push({
            tokenAddress: ethers.constants.AddressZero as Address,
            tokenAmount: deposit.nativeTokenAmount.toString(),
          });
        }
        if (deposit?.erc20TokenAmount && deposit?.erc20TokenAmount?.gt('0')) {
          res.push({
            tokenAddress: deposit.erc20Token,
            tokenAmount: deposit.erc20TokenAmount.toString(),
          });
        }
      }
      const fullDeposits = await promiseChain(res.map(convertDepositFragmentToDeposit));
      return fullDeposits;
    } catch (err) {
      console.error('Error loading deposits', err);
      return [];
    }
  };

  const flushTokens = async (targetFlushAddress?: Address): Promise<ContractTransaction> => {
    const signer = library?.getSigner(currentAccount);
    if (!lootbox || !signer || !network?.chainId) {
      throw new Error('Connect MetaMask');
    }

    const connectedChainIDHex = chainIdToHex(network.chainId);
    if (chainIDHex && connectedChainIDHex && connectedChainIDHex !== chainIDHex) {
      throw new Error(`Wrong network, please connect ${chainIDHex}`);
    }

    if (!targetFlushAddress) {
      targetFlushAddress = currentAccount;
    }

    if (!ethers.utils.isAddress(targetFlushAddress || '')) {
      throw new Error('Invalid flush address');
    }

    console.log('calling contract flush tokens', targetFlushAddress);

    return lootbox
      .connect(signer)
      .flushTokens(targetFlushAddress) as Promise<ethers.ContractTransaction>;
  };

  return {
    lootbox,
    depositNative,
    depositERC20,
    changeMaxTickets,
    getLootboxDeposits,
    flushTokens,
  };
};
