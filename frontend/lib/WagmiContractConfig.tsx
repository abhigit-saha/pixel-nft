import contractABI from "../../artifacts/contracts/Nft.sol/NftFactory.json";

const wagmiContractConfig = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi: contractABI,
};

export { wagmiContractConfig };
