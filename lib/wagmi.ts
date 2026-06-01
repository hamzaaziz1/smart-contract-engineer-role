import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";

/** Injected wallet only (MetaMask, Rabby, etc.) — avoids WalletConnect relay errors on localhost. */
export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(rpcUrl),
    [sepolia.id]: http(),
  },
  ssr: true,
});
