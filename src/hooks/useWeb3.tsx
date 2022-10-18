import { Address, ChainIDHex } from '@wormgraph/helpers';
import { ethers } from 'ethers';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { manifest } from '@/manifest';
import WalletConnect from '@walletconnect/web3-provider';

interface IWeb3Context {
  library?: ethers.providers.Web3Provider;
  currentAccount?: Address; // connected address
  accounts?: Address[];
  network?: ethers.providers.Network;
  connectWallet: () => Promise<void>;
  switchNetwork: (chainIdHex: ChainIDHex) => Promise<void>;
}

const Web3Context = createContext<IWeb3Context>({
  connectWallet: async () => {},
  switchNetwork: async () => {},
});

export const providerOptions = {
  // coinbasewallet: {
  //   package: CoinbaseWalletSDK,
  //   options: {
  //     appName: "Web 3 Modal Demo",
  //     infuraId: process.env.INFURA_KEY
  //   }
  // },
  walletconnect: {
    package: WalletConnect,
    options: {
      infuraId: 'dadab9b61b484421a252e7b42c4bde53',
    },
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  disableInjectedProvider: false,
  providerOptions,
});

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {}
export const Web3Provider = (props: PropsWithChildren<Web3ProviderProps>) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [library, setLibrary] = useState<ethers.providers.Web3Provider>();
  const [accounts, setAccounts] = useState<Address[]>([]);
  const [network, setNetwork] = useState<ethers.providers.Network>();

  const refreshState = () => {
    setAccounts([]);
    setNetwork(undefined);
  };

  const disconnect = async () => {
    web3Modal.clearCachedProvider();
    refreshState();
  };

  const connectWallet = async () => {
    try {
      const _provider = await web3Modal.connect();
      const _library = new ethers.providers.Web3Provider(_provider);
      const _accounts = await _library.listAccounts();
      const _network = await _library.getNetwork();
      setProvider(_provider);
      setLibrary(_library);
      setNetwork(_network);
      if (_accounts) {
        setAccounts(_accounts as Address[]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (newAccounts: Address[]) => {
        if (newAccounts) {
          setAccounts(newAccounts);
        }
      };

      const handleChainChanged = (chainIDHex: ChainIDHex) => {
        console.log('chain change', chainIDHex);
        window.location.reload();
      };

      const handleDisconnect = () => {
        console.log('disconnect');
        disconnect();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
    return;
  }, [provider]);

  const switchNetwork = async (chainIdHex: ChainIDHex) => {
    if (!library?.provider?.request) {
      console.log('no provider');
      return;
    }
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      const chainInfo = manifest.chains.find((chain) => chain.chainIdHex === chainIdHex);
      // @ts-ignore
      if (chainInfo && switchError?.code === 4902) {
        try {
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainInfo.chainIdHex,
                chainName: chainInfo.chainName,
                nativeCurrency: chainInfo.nativeCurrency,
                rpcUrls: chainInfo.rpcUrls,
                blockExplorerUrls: chainInfo.blockExplorerUrls,
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        currentAccount: accounts[0],
        accounts,
        network: network,
        library,
        connectWallet,
        switchNetwork,
      }}
    >
      {props.children}
    </Web3Context.Provider>
  );
};

export default useWeb3;
