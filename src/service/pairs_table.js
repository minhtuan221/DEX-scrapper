class PairsList {
  constructor() {
    this.pair_list = new Map()
    this.output_table = {}
  }

  add(pair_profile) {
    pair_profile.init().then(() =>
      this.pair_list.set(pair_profile.name, pair_profile))
  }

  query() {
    for (const key of this.pair_list.keys()) {
      let p = this.pair_list.get(key)
      p.refresh().then(() => this.output_table[key] = p.summary())
    }
  }
  run_interval(t = 2000) {
    setInterval(() => {
      this.query()
      console.table(this.output_table)
    }, t)
  }
}

module.exports = {PairsList}