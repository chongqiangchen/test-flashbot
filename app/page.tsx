"use client";
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers5/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button';
import { addToNetwork } from '@/lib/network';
import { useLocalStorageState } from "ahooks"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { trade } from '@/lib/flashbot';

export default function Home() {
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [uuid, setUUID] = useLocalStorageState<string>("uuid")

  const handleGenerateUUID = async () => {
    setUUID(uuidv4())
  }

  const handleAddNextwork = async () => {
    const result = await addToNetwork({ address: address || "", uuid: uuid! })
    console.log(result)
  }

  const send = async () => {
    await axios.post("http://localhost:8000/flashbot/submit", {
      uuid
    })
  }

  const getBalance2 = async () => {
    if (!isConnected) throw Error('User disconnected')

    const ethersProvider = new ethers.providers.Web3Provider(walletProvider!)
    const signer = ethersProvider.getSigner()

    const transaction0 = {
      to: "0x11346Aa19b6553DC3508F04015B4c2c749380D50",
      value: ethers.utils.parseEther("0.0001"),
    }

    const tx = await signer.sendTransaction(transaction0);
    console.log(tx);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col gap-4">
        <Button onClick={() => trade()}>测试</Button>
      </div>
    </main>
  );
}
