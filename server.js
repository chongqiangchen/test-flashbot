// server.js
const express = require('express');
const cors = require('cors');
const { FlashbotsBundleProvider, FlashbotsBundleResolution } = require("@flashbots/ethers-provider-bundle");
const ethers = require("ethers");
const bodyParser = require('body-parser');
const axios = require("axios");
const {isEmpty} = require("lodash");

const { config } = require('dotenv')
config();

const app = express();
const port = 8000; // 你可以选择自己想要的端口号

app.use(cors());
app.use(bodyParser.json());


const fetchFlashbot = async (uuid) => {
    const response = await axios.get(`https://rpc.flashbots.net/bundle\?id\=${uuid}`);
    return response.data;
}


const trade = async (uuid) => {
    const bundleJson = await fetchFlashbot(uuid);
    const bundles = bundleJson?.rawTxs.reverse();

    if (isEmpty(bundles)) {
        console.log("No bundles");
        return;
    }

    const transactionBundles = bundles.map((bundle) => {
        return {
            signedTransaction: bundle
        }
    })

    const ALCHEMY_GOERLI_URL = 'https://eth-mainnet.g.alchemy.com/v2/-x5fEf6Fmg6nFI2FJH992NLRl68lYFS4';
    const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
    const userSigner = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, userSigner);
    const signedTransactions = await flashbotsProvider.signBundle(transactionBundles)
    const targetBlockNumber = (await userSigner.provider.getBlockNumber()) + 1
    const simulation = await flashbotsProvider.simulate(signedTransactions, targetBlockNumber)

    try {
        if ("error" in simulation) {
            throw Error(`模拟交易出错: ${simulation.error.message}`)
        } else {
            console.log(`模拟交易成功`);
            console.log(JSON.stringify(simulation, null, 2))
        }

        for (let i = 1; i <= 100; i++) {
            console.log(i);
            let targetBlockNumberNew = targetBlockNumber + i - 1;
            // 发送交易
            const res = await flashbotsProvider.sendRawBundle(signedTransactions, targetBlockNumberNew);
            if ("error" in res) {
                throw new Error(res.error.message);
            }
            // 检查交易是否上链
            const bundleResolution = await res.wait();
            // 交易有三个状态: 成功上链/没有上链/Nonce过高。
            if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
                console.log(`恭喜, 交易成功上链，区块: ${targetBlockNumberNew}`);
                console.log(JSON.stringify(res, null, 2));
                return;
            } else if (
                bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion
            ) {
                throw Error(`交易没有被纳入区块，请重试: ${targetBlockNumberNew}`);
            } else if (
                bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh
            ) {
                throw Error("Nonce太高，请重新设置");
            }
        }
    } catch (e) {
        console.log(e);
    }

    return {
        bundleId: bundleJson.bundleId,
    }
}

app.post('/flashbot/submit', async (req, res) => {
    console.log(req.body);
    await trade(req.body.uuid);
    res.send({});
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});