import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { createWalletClient } from "viem";
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";
import { custom } from "viem";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

export const wagmiConfig = defaultWagmiConfig({
  chains: [sepolia, mainnet],
  projectId,
  metadata,
  ssr: true,
  transports: {
    [sepolia.id]: http("https://sepolia.gateway.tenderly.co"),
    [mainnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: false,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
