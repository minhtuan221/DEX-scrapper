const config = require("../../../config")
const {PairProfileBase} = require("../../interface/pair_profile")
const ethers = require('ethers');
const { Pool, Route, Trade } = require("@uniswap/v3-sdk");
const { CurrencyAmount, Token, TradeType } = require("@uniswap/sdk-core");
const { abi } = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const Quoter = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const provider = config.customHttpProvider

const usdc_weth_pool_address = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

function now() {
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime
}

async function getPoolImmutables(poolContract) {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.factory(),
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.maxLiquidityPerTick(),
    ]);

  const immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
  return immutables;
}


async function getPoolState(poolContract) {
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  const PoolState = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };

  return PoolState;
}


async function createPool(poolAddress, token0_name, token1_name) {
  const poolContract = new ethers.Contract(
    poolAddress,
    abi,
    config.customHttpProvider
  );

  const [immutables, state] = await Promise.all([
    getPoolImmutables(poolContract),
    getPoolState(poolContract),
  ]);

  const TokenA = new Token(3, immutables.token0, 6, token0_name, "USD Coin");

  const TokenB = new Token(3, immutables.token1, 18, token1_name, "Wrapped Ether");

  const poolExample = new Pool(
    TokenA,
    TokenB,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  );
  return poolExample
}

class PairProfileV3 extends PairProfileBase {
  constructor(name, poolAddress, token0_name, token1_name, trade_amount, token0_decimal=18, token1_decimal=6) {
    super();
    this.name = name
    this.poolAddress = poolAddress
    this.token0_name = token0_name
    this.token1_name = token1_name
    this.token0_decimal = token0_decimal
    this.token1_decimal = token1_decimal
    this.trade_amount = trade_amount
    this.poolContract = new ethers.Contract(
      poolAddress,
      abi,
      provider
    );
  }

  init = async () => {
  }

  refresh = async () => {
    const poolContract = new ethers.Contract(
      this.poolAddress,
      abi,
      config.customHttpProvider
    );

    const quoterContract = new ethers.Contract(quoterAddress, Quoter.abi, provider);

    const [immutables, state] = await Promise.all([
      getPoolImmutables(poolContract),
      getPoolState(poolContract),
    ]);

    const TokenA = new Token(3, immutables.token0, this.token0_decimal, this.token0_name, "Wrapped");

    const TokenB = new Token(3, immutables.token1, this.token1_decimal, this.token1_name, "USD Coin");

    this.pool = new Pool(
      TokenA,
      TokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick
    );
    // assign an input amount for the swap
    const amountIn = this.trade_amount;
    // console.log(this.pool)

    // call the quoter contract to determine the amount out of a swap, given an amount in
    this.quote = await quoterContract.callStatic.quoteExactInputSingle(
      immutables.token0,
      immutables.token1,
      immutables.fee,
      amountIn.toString(),
      0
    );

    // create an instance of the route object in order to construct a trade object
    this.route = new Route([this.pool], TokenA, TokenB);
    // console.log(amountIn, this.quote.toString())

    // create an unchecked trade instance
    this.trade = await Trade.createUncheckedTrade({
      route: this.route,
      inputAmount: CurrencyAmount.fromRawAmount(TokenA, amountIn.toString()),
      outputAmount: CurrencyAmount.fromRawAmount(TokenB, this.quote.toString()
      ),
      tradeType: TradeType.EXACT_INPUT,
    });
    this.midPrice = this.pool.token0Price.toSignificant(10)
    this.bidPrice = this.trade.executionPrice.toSignificant(10)

    // print the quote and the unchecked trade instance in the console
    // console.log("this is mid price", this.quote.toString())
    // console.log("this is trade", this.trade)
    // console.log("The bidPrice is", this.trade.executionPrice.toSignificant(10));
  }

  summary = () =>{
    return {
      name: this.name,
      midPrice: this.midPrice,
      execution_price: this.bidPrice,
      updated_at: now()
    }
  }

}

async function main() {

  // const DAI_USDC_POOL = await createPool(usdc_weth_pool_address, "USDC", "WETH");

  // const token0Price = DAI_USDC_POOL.token0Price;
  // const token1Price = DAI_USDC_POOL.token1Price;

  // console.log(token0Price.toSignificant(6), token1Price.toSignificant(6))
  p = new PairProfileV3("USDC/WETH",usdc_weth_pool_address, "USDC", "WETH", 1000)
  await p.refresh()
  console.log(p.summary())
}

// main()

module.exports = {PairProfileV3}