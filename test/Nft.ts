import { expect } from "chai";
import hre from "hardhat";
import NftModule from "../ignition/modules/Nft";
import { Address, getAddress, verifyHash } from "viem";
import { parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/_types/actions/public/waitForTransactionReceipt";
import { should } from "chai";
import { useWriteContract } from "wagmi";
const { writeContract } = useWriteContract();
describe("MyNft", function () {
  it("Should get deployed by the right address", async function () {
    const { nftFactory } = await hre.ignition.deploy(NftModule);

    const [owner] = await hre.viem.getWalletClients();
    const contractOwner = await nftFactory.read.owner();
    expect(getAddress(contractOwner)).to.equal(
      getAddress(owner.account.address)
    );
  });
  it("Should mint when user transfers enough eth", async function () {
    const { nftFactory } = await hre.ignition.deploy(NftModule);
    const publicClient = await hre.viem.getPublicClient();
    const [owner] = await hre.viem.getWalletClients();
    const recipient = "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address;
    const mintedId = await nftFactory.write.payToMint(
      [recipient, "ipfs://QmazFsfNhwLG3qiRRugo7x3S5gp92pdWTKPP11QTNs"],
      { value: parseEther("0.05") }
    );
    const txHash = writeContract({
      address: nftFactory.address,
      abi: nftFactory.abi,
      functionName: "payToMint",
      args: [
        "0xb0F4067A0a2C2e8C48e76d9a4804cD58865481Ec" as Address,
        "abcdefgh",
      ],
      value: parseEther("0.01"),
    });
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: txHash,
    });

    // Check that the transaction was successful
    expect(receipt.status).to.equal(1);
  });
});
