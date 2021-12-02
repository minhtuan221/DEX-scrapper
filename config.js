const ethers = require('ethers');  
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType } = require ('@uniswap/sdk');

// const url = 'https://mainnet.infura.io/v3/12748466006d434087b1ab524535080e';
// const url = "\\\\.\\pipe\\geth.ipc";
const url = 'http://localhost:8545';

const customHttpProvider = new ethers.getDefaultProvider(url);
const chainId = ChainId.MAINNET;

module.exports = {url, customHttpProvider, chainId}