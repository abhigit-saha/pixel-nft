import { useEffect, useState } from "react";
import { createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import { http, custom } from "viem";

export function Account({ account }: { account: any }) {
  const [balance, setBalance] = useState<BigInt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getBalance() {
      try {
        // Use MetaMask's provider if available, otherwise fallback to localhost
        const client = createPublicClient({
          transport: window.ethereum
            ? custom(window.ethereum)
            : http("http://127.0.0.1:8545/"),
          chain: sepolia, // Or whichever network you want to support
        });

        const balance = await client.getBalance({
          address: account.address as `0x${string}`,
        });

        setBalance(balance);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
        setError("Failed to fetch balance");
      }
    }

    if (account?.address) {
      getBalance();
    }
  }, [account.address]);

  if (error) {
    return (
      <div className="bg-black text-red-500 p-4 rounded-lg">Error: {error}</div>
    );
  }

  return (
    <div className="bg-black text-white p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Account Balance</h2>
      <p className="text-lg">
        Balance in Wei: {balance ? String(balance) : "Loading..."}
      </p>
      {balance && (
        <p className="text-lg mt-2">
          Balance in ETH: {(Number(balance) / Math.pow(10, 18)).toFixed(4)} ETH
        </p>
      )}
    </div>
  );
}
