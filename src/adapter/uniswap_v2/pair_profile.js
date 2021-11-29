const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Token } = require('@uniswap/sdk');
const config = require('../../../config')
const {PairProfileBase} = require("../../interface/pair_profile")

function now() {
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime
}


class PairsProfileV2 extends PairProfileBase {
  constructor(name, config, token_address_up, token_address_down, trade_amount) {
    super();
    this.name = name
    this.config = config
    this.token_address1 = token_address_down
    this.token_address2 = token_address_up
    this.trade_amount = trade_amount
  }

  init = async () => {
    this.token1 = await Fetcher.fetchTokenData(this.config.chainId, this.token_address1, this.config.customHttpProvider)
    this.token2 = await Fetcher.fetchTokenData(this.config.chainId, this.token_address2, this.config.customHttpProvider)
    this.pair = await Fetcher.fetchPairData(this.token1, this.token2, this.config.customHttpProvider)
    this.route = new Route([this.pair], this.token2)
    this.trade = new Trade(this.route, new TokenAmount(this.token2, this.trade_amount), TradeType.EXACT_INPUT)
  }

  refresh = async () => {
    this.pair = await Fetcher.fetchPairData(this.token1, this.token2, this.config.customHttpProvider)
    this.route = new Route([this.pair], this.token2)
    this.trade = new Trade(this.route, new TokenAmount(this.token2, this.trade_amount), TradeType.EXACT_INPUT)
  }

  midPrice = () => {
    return this.route.midPrice.toSignificant(6)
  }

  invertMidPrice = () => {
    return this.route.midPrice.invert().toSignificant(6)
  }

  bidPrice = () => {
    return this.trade.executionPrice.toSignificant(6);
  }

  nextBidPrice = () => {
    return this.trade.nextMidPrice.toSignificant(6)
  }

  summary = ()=>{
    return {
      name: this.name,
      midPrice: this.midPrice(),
      execution_price: this.bidPrice(),
      updated_at: now()
    }
  }

}

const get_pair_profile = async (pair_name, token_address1, token_address2, trade_amount = '100000000000000000') => {
  const dai = await Fetcher.fetchTokenData(config.chainId, token_address1, config.customHttpProvider);
  const weth = await Fetcher.fetchTokenData(config.chainId, token_address2, config.customHttpProvider);
  const pair = await Fetcher.fetchPairData(dai, weth, config.customHttpProvider);
  // console.log(pair)
  const route = new Route([pair], weth);
  const trade = new Trade(route, new TokenAmount(weth, trade_amount), TradeType.EXACT_INPUT);
  // console.log("Input Price WETH --> DAI:", route.pairs);
  // console.log("Output Price WETH --> DAI:", route.output.decimals);

  console.log(pair_name, "-".repeat(45));
  console.log(`Mid Price ${pair_name}:`, route.midPrice.toSignificant(6));
  console.log(`Mid Price Invert ${pair_name}:`, route.midPrice.invert().toSignificant(6));
  console.log(`Execution Price ${pair_name} with trade volume ${trade_amount}:`, trade.executionPrice.toSignificant(6));
  console.log(`Mid Price ${pair_name} after trade volume ${trade_amount}:`, trade.nextMidPrice.toSignificant(6));
  return {
    pair_name: pair_name,
    mid_price: route.midPrice.toSignificant(6),
    execution_price: trade.executionPrice.toSignificant(6),
    mid_price_after_trade: trade.nextMidPrice.toSignificant(6)
  }
}

// get_pair_profile("WETH/DAI", token_address.dai, token_address.weth)
//get_pair_profile("BTC/DAI", token_address.dai, token_address.wbtc, trade_amount=100000)
//get_pair_profile("USDT/DAI", token_address.dai, token_address.usdt, trade_amount=1)
//get_pair_profile("USDC/DAI", token_address.dai, token_address.usdc, trade_amount=1)

module.exports = {PairsProfileV2}

// btc_dai.init().then(() => {
//   setInterval(async () => {
//     let midprice = btc_dai.bidPrice()
//     let summary = btc_dai.summary()
//     console.table({ 'btc/dai': summary, 'btc/dai_v2': summary })
//   }, 2000)
// })