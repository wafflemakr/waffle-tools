export const KNOWN_ADDRESSES = [
  {
    address: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    name: "Uniswap Router V2",
  },
  {
    address: "0x818e6fecd516ecc3849daf6845e3ec868087b755",
    name: "Kyber Network Proxy",
  },
  {
    address: "0xecf0bdb7b3f349abfd68c3563678124c5e8aaea3",
    name: "Kyber Staking",
  },
  {
    address: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
    name: "Master Chef",
  },
];

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    type: "function",
  },
];
