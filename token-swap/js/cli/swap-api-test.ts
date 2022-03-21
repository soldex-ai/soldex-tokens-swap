import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Account, Connection, PublicKey } from "@solana/web3.js";
import { CurveType, TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "../src";
import { newAccountWithLamports } from "../src/util/new-account-with-lamports";
import { url } from "../src/util/url";
import { createPoolWithKeypair, TokenProvideInfo, FeeParams, getPools } from "./swap-api";

// Pool fees
const TRADING_FEE_NUMERATOR = 25;
const TRADING_FEE_DENOMINATOR = 10000;
const OWNER_TRADING_FEE_NUMERATOR = 5;
const OWNER_TRADING_FEE_DENOMINATOR = 10000;
const OWNER_WITHDRAW_FEE_NUMERATOR = 1;
const OWNER_WITHDRAW_FEE_DENOMINATOR = 6;
const HOST_FEE_NUMERATOR = 20;
const HOST_FEE_DENOMINATOR = 100;

let swapPayer = new Account([124,214,7,64,214,151,39,130,214,22,203,219,155,180,53,181,114,27,168,169,68,109,160,106,244,199,38,164,32,93,232,88,134,27,27,159,235,177,234,184,178,130,24,236,194,175,178,41,1,146,105,104,112,246,166,181,208,108,55,146,127,8,246,24]);
let feeOwner = new Account([30,72,146,239,125,42,31,114,39,254,222,19,107,128,227,49,72,67,15,179,200,44,196,47,113,215,87,244,166,62,9,64,235,22,239,76,86,188,196,67,204,110,174,27,101,236,214,15,167,127,87,199,134,29,225,207,153,255,77,181,21,103,153,190]);
