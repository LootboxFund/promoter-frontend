import { Address, ChainIDHex } from '@wormgraph/helpers';
import { ContractTransaction, ethers } from 'ethers';
import useReadOnlyProvider from './useReadOnlyProvider';
import useWeb3 from './useWeb3';

export const useERC20 = ({ chainIDHex }: { chainIDHex: ChainIDHex }) => {
  const { library, currentAccount } = useWeb3();
  const { provider } = useReadOnlyProvider({ chainIDHex });

  const getAllowance = async (
    ownerAddress: Address,
    spenderAddress: Address,
    tokenAddress: Address,
  ): Promise<ethers.BigNumber> => {
    if (!provider) {
      throw new Error('Unsupported chain');
    }

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      ['function allowance(address, address) view returns (uint256)'],
      provider,
    );
    const allowance = await erc20Contract.allowance(ownerAddress, spenderAddress);

    return ethers.BigNumber.from(allowance);
  };

  const getSymbol = async (tokenAddress: Address): Promise<string> => {
    if (!provider) {
      throw new Error('Unsupported chain');
    }

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      ['function symbol() view returns (string)'],
      provider,
    );
    const symbol = await erc20Contract.symbol();
    return symbol;
  };

  const getDecimals = async (tokenAddress: Address): Promise<ethers.BigNumber> => {
    if (!provider) {
      throw new Error('Unsupported chain');
    }

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      ['function decimals() view returns (uint8)'],
      provider,
    );
    const decimals = await erc20Contract.decimals();
    return ethers.BigNumber.from(decimals);
  };

  const approveTokenAmount = async (
    ownerAddress: Address,
    spenderAddress: Address,
    tokenAddress: Address,
    amount: ethers.BigNumber,
  ): Promise<ContractTransaction> => {
    const signer = library?.getSigner(currentAccount);
    if (!currentAccount || !library || !signer) {
      throw new Error('Please connect MetaMask');
    }

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      ['function approve(address, uint256) external returns (bool)'],
      signer,
    );

    const tx = await erc20Contract.approve(spenderAddress, amount);

    // await tx.wait();  Call this in outer functions
    return tx;
  };

  return {
    getSymbol,
    getDecimals,
    getAllowance,
    approveTokenAmount,
  };
};

export default useERC20;
