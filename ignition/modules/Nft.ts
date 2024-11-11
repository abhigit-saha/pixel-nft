// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const NftModule = buildModule("NftModule", (m) => {
  const ownerAddress = "0x1A0822CF70119d28CE4068571D4486c7DDD23598";

  const nftFactory = m.contract("NftFactory", [m.getAccount(0)]);

  return { nftFactory };
});

export default NftModule;
