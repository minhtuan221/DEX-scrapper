const { PairsProfileV2 } = require("./src/adapter/uniswap_v2/pair_profile");
const { PairProfileV3 } = require("./src/adapter/uniswap_v3/pair_profile")
const {PairsList } = require("./src/service/pairs_table")
const config = require("./config");
const token_address = require("./src/adapter/uniswap_v2/address");
const pool_addres_list = require("./src/adapter/uniswap_v3/address")

async function main(refresh_interval=3000) {

    let eth_dai = new PairsProfileV2("V2 ETH/DAI", config, token_address.weth, token_address.dai, '100000000000000000')
    let btc_dai = new PairsProfileV2("V2 BTC/DAI", config, token_address.wbtc, token_address.dai, '100000')
    let usdt_dai = new PairsProfileV2("V2 USDT/DAI", config, token_address.usdt, token_address.dai, '1')
    let usdc_dai = new PairsProfileV2("V2 USDC/DAI", config, token_address.usdc, token_address.dai, '1')
  
    let btc_usdc = new PairProfileV3("V3 BTC/USDC", pool_addres_list.btc_usdc_pool_address, "BTC", "USDC", 1000, 8)
    let weth_usdt = new PairProfileV3("V3 WETH/USDT", pool_addres_list.weth_usdt_pool_address, "WETH", "USDT", 1000000000000)
    let usdc_usdt = new PairProfileV3("V3 USDC/USDT", pool_addres_list.usdc_usdt_pool_address, "USDC", "USDT", 1000, 6)
  
    pair_list = new PairsList()
    pair_list.add(eth_dai)
    pair_list.add(btc_dai)
    pair_list.add(usdt_dai)
    pair_list.add(usdc_dai)
  
    pair_list.add(btc_usdc)
    pair_list.add(weth_usdt)
    pair_list.add(usdc_usdt)
    pair_list.run_interval(refresh_interval)
  }
  
main()
