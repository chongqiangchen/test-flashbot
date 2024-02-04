

import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import axios from "axios";
import { ethers } from "ethers";

const fetchFlashbot = async (uuid: string) => {
    const response = await axios.get<{ rawTxs: string[]; bundleId: string }>(`https://rpc.flashbots.net/bundle\?id\=${uuid}`);
    return response.data;
}

export const trade = async () => {
    const ALCHEMY_GOERLI_URL = 'https://eth-mainnet.g.alchemy.com/v2/-x5fEf6Fmg6nFI2FJH992NLRl68lYFS4';
    const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
    const userSigner = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, provider);
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, userSigner);
    const res = await flashbotsProvider.getBundleStatsV2("0x65467c83446d4373020d4ff08378881d482106a7894f9162d860db08ec236165", 19155896)
    console.log(res);
}