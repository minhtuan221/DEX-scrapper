import { PairsProfile } from "./uniswap_v2/pair_profile";
import * as config from "../config";
import * as token_address from "./uniswap_v2/token/address";


class PairsList {
  pair_list: Map<String,PairsProfile>
  output_table: Map<String, Object>
  constructor() {
    this.pair_list = new Map()
    this.output_table = new Map()
  }

  add(pair_profile: PairsProfile): void {
    this.pair_list.set(pair_profile.name, pair_profile)
  }

  query(): void {
    for (const key of this.pair_list.keys()) {
      let p = this.pair_list.get(key)
      this.output_table.set(key, p.summary())
    }
  }
  run_interval(t: Number): void {
    setInterval( () => {
      console.table(this.output_table)
    }, 2000)
  }
}


// let eth_dai = new PairsProfile("BTC/DAI", config, token_address.weth, token_address.dai, '100000000000000000')
