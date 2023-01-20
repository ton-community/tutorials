import { Contract, Address, Cell, contractAddress, beginCell } from "ton-core";

class Counter implements Contract {

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  static forDeploy(code: Cell, initialCount: number): Counter {
    const data = beginCell()
      .storeUint(initialCount, 32)
      .endCell();
    const address = contractAddress(0, { code, data });
    return new Counter(address, { code, data });
  }

}
