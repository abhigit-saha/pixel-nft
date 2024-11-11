import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { Address, parseEther, transactionType } from "viem";
import { client } from "@/app/page";
const IPFS_GATEWAY_URLS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
];
import { walletClient } from "@/lib/config";

import contractABI from "../../artifacts/contracts/Nft.sol/NftFactory.json";
import { readContract } from "viem/actions";
import { metadata } from "@/app/layout";

const contractAddress = "0x1A0822CF70119d28CE4068571D4486c7DDD23598" as Address;

const NftCard = ({
  metadataHash,
  imageHash,
}: {
  metadataHash: string;
  imageHash: string;
}) => {
  const [ipfsImageUrl, setIpfsImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const fetchIPFSImage = async (hash: string) => {
    for (const gateway of IPFS_GATEWAY_URLS) {
      try {
        const response = await axios.get(`${gateway}${hash}`, {
          responseType: "blob",
        });
        if (
          response.status === 200 &&
          response.data.type.startsWith("image/")
        ) {
          return URL.createObjectURL(response.data);
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${gateway}`, error);
      }
    }
    throw new Error("Failed to fetch image from all gateways");
  };

  const metadataUri = `ipfs://${metadataHash}`;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageUrl = await fetchIPFSImage(imageHash);
        setIpfsImageUrl(imageUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching IPFS image:", error);
        setLoadError(true);
        setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (ipfsImageUrl) {
        URL.revokeObjectURL(ipfsImageUrl);
      }
    };
  }, []);
  const { address, isConnected } = useAccount();

  const handleMint = async () => {
    setIsMinting(true);

    try {
      const [account] = await walletClient.getAddresses();
      await walletClient.writeContract({
        address: contractAddress,
        abi: contractABI.abi,
        functionName: "payToMint",
        args: [address, metadataUri],
        value: parseEther("0.01"),
        account: account,
      });
      // writeContract({
      //   address: contractAddress,
      //   abi: contractABI.abi,
      //   functionName: "payToMint",
      //   args: [address, metadataUri],
      //   value: parseEther("0.01"),
      // });
      console.log("Address: ", address);
      console.log("contractAddress ", contractAddress);
      console.log("Account", account);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (isTransactionSuccess) {
      setIsMinting(false);
    }
  }, [isTransactionSuccess]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="w-full h-64 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <p className="text-white">Loading...</p>
          </div>
        ) : loadError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <p className="text-white">Failed to load image</p>
          </div>
        ) : (
          <img
            src={
              ipfsImageUrl || `https://gateway.pinata.cloud/ipfs/${imageHash}`
            }
            alt={imageHash}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{imageHash}</h2>
        <p className="text-blue-400 mb-4">0.05 ETH</p>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleMint}
          disabled={isMinting || isTransactionLoading}
        >
          {isMinting || isTransactionLoading ? "Minting..." : "Mint"}
        </Button>
        {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
        {isTransactionSuccess && (
          <p className="text-green-500 mt-2">NFT minted successfully!</p>
        )}
      </div>
    </div>
  );
};

export default NftCard;
