"use client";
import React, { useState, useEffect } from "react";
import ReadContract from "@/components/ReadContract";
import WriteContract from "@/components/WriteContract";
import { homedir } from "os";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { WalletOptions } from "@/components/WalletOptions";
import { PinataSDK } from "pinata";
import { getBalance } from "viem/actions";
import {
  Abi,
  AbiConstructorNotFoundError,
  createPublicClient,
  getContract,
  parseAbi,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { http } from "viem";
import { Account } from "@/components/Account";
import NftFactory from "../../artifacts/contracts/Nft.sol/NftFactory.json";
const contractAddress = "0x1A0822CF70119d28CE4068571D4486c7DDD23598";
import NftCarousel from "@/components/NftCarousel";
import NftCard from "@/components/NftCard";
import axios from "axios";
export const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const nftFactory = getContract({
  abi: NftFactory.abi,
  address: contractAddress,
  client: client,
});
const nfts = [
  {
    id: 1,
    name: "QmY57cDDRvvpWjjLeQyQfW21guZDCG99VbkqW96we24U1j",
    price: "0.5 ETH",
  },
  { id: 2, name: "Digital Dreamscape", price: "0.7 ETH" },
  { id: 3, name: "Neon Nebula", price: "0.6 ETH" },
  { id: 4, name: "Quantum Quasar", price: "0.8 ETH" },
  { id: 5, name: "Cyber Serenity", price: "0.55 ETH" },
  { id: 6, name: "Astral Anomaly", price: "0.75 ETH" },
];
const Home = () => {
  const account = useAccount();
  const [metadataHashes, setMetadataHashes] = useState<string[]>([]);
  const [imageHashes, setImageHashes] = useState<string[]>([]);
  useEffect(() => {
    async function getImageHash() {
      const response = await axios.get("http://localhost:8080/ipfs");
      console.log("Data got from the database", response.data);
      const localMetadataHashes: string[] = [];
      const localImageHashes: string[] = [];
      for (let i = 0; i < response.data.length; i++) {
        const url = `https://gateway.pinata.cloud/ipfs/${response.data[i].ipfsHash}`;
        // setMetadataHashes([...metadataHashes, response.data[i].ipfsHash]);
        localMetadataHashes.push(response.data[i].ipfsHash);
        const metadata = await axios.get(url, { responseType: "json" });
        console.log("METADATA FOUND: ", metadata.data);
        // setImageHashes([...imageHashes, metadata.data.imageIpfsHash]);
        localImageHashes.push(metadata.data.imageIpfsHash);
      }
      setMetadataHashes(localMetadataHashes);
      setImageHashes(localImageHashes);
    }
    getImageHash();
  }, []);

  if (account.isConnected)
    return (
      <>
        <div>
          <div>
            <Account account={account} />
          </div>

          <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">
              NFT Marketplace
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {/* {nfts.map((nft) => (
                <NftCard nft={nft} />
              ))} */}
              {metadataHashes.map((hash, index) => (
                <NftCard
                  key={index}
                  metadataHash={hash}
                  imageHash={imageHashes[index]}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  return (
    // </main>
    <>
      <WalletOptions />
    </>
  );
};
export default Home;
