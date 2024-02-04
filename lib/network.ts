import { ethers } from 'ethers';

const toHex = (num: number) => {
    return "0x" + num.toString(16);
};

export const generateFlashbotRpc = (uuid: string) => {
    return `https://rpc.flashbots.net?bundle=${uuid}`
}

export async function addToNetwork({ address, uuid }: { address: string, uuid: string }): Promise<any>{
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const params = {
                chainId: toHex(1), // A 0x-prefixed hexadecimal string
                chainName: `flashbots-${uuid}`,
                nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                },
                rpcUrls: [`https://rpc.flashbots.net?bundle=${uuid}`],
                blockExplorerUrls: ["https://etherscan.io"],
            };
            return await provider.send('wallet_addEthereumChain', [params, address]);
        } else {
            throw new Error("No Ethereum Wallet");
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}