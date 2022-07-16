import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from "react";
import { EthProvider } from "react-web3-daisyui/dist/eth";
import { providers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const web3Modal = new Web3Modal({
  cacheProvider: true, // very important
  network: "mainnet",
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_WALLET_CONNECT_INFURA_ID,
      }
    },
  }
});

export interface Web3Context {
  ethersProvider?: providers.Web3Provider;
  accountAddress?: string;
  chainId?: number;
  connectWallet: () => Promise<any>;
  loading?: boolean;
  signer?: providers.JsonRpcSigner
}

export const web3Context = createContext<Web3Context>({
  connectWallet: () => Promise.resolve(),
  loading: false,
});

export const Web3ComponentsProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { ethersProvider, accountAddress, chainId } = useContext(web3Context);
  return (
    <EthProvider
      value={{
        ethersProvider,
        accountAddress,
        chainId,
        cryptoIconsBaseUrl: "/symbols",
      }}
    >
      {children}
    </EthProvider>
  );
};

export const Web3Provider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ethersProvider, setEthersProvider] =
    useState<providers.Web3Provider>();
  const [accountAddress, setAccountAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [signer, setSigner] = useState<providers.JsonRpcSigner>()
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!ethersProvider) {
        return;
      }
      window.ethereum.on("accountsChanged", async function (accounts: any) {
        if (accounts[0]) {
          setAccountAddress(accounts[0]);
        } else {
          await web3Modal.clearCachedProvider();
          setAccountAddress(undefined);
        }
      });
      window.ethereum.on("chainChanged", async function () {
        window.location.reload();
      });
    })();
  }, [ethersProvider]);

  const connectWallet = async () => {
    if (!web3Modal) {
      return;
    }
    const provider = await web3Modal.connect();
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner()
    const accountAddress = await signer.getAddress();
    const network = await ethersProvider.getNetwork();
    setEthersProvider(ethersProvider);
    setAccountAddress(accountAddress);
    setChainId(network.chainId);
    setLoading(false);
    setSigner(signer);
  };

  return (
    <web3Context.Provider
      value={{
        ethersProvider,
        accountAddress,
        chainId,
        connectWallet,
        loading,
        signer,
      }}
    >
      <Web3ComponentsProvider>{children}</Web3ComponentsProvider>
    </web3Context.Provider>
  );
};
