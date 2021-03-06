import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {AccountLayout, Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';

import {TokenSwap, CurveType, TOKEN_SWAP_PROGRAM_ID} from '../src';
import {sendAndConfirmTransaction} from '../src/util/send-and-confirm-transaction';
import {newAccountWithLamports} from '../src/util/new-account-with-lamports';
import {url} from '../src/util/url';
import {sleep} from '../src/util/sleep';
import {Numberu64} from '../dist';

// The following globals are created by `createTokenSwap` and used by subsequent tests
// Token swap
let tokenSwap: TokenSwap;
// authority of the token and accounts
let authority: PublicKey;
// bump seed used to generate the authority public key
let bumpSeed: number;
// owner of the user accounts
let owner: Account;
// Token pool
let tokenPool: Token;
let tokenAccountPool: PublicKey;
let feeAccount: PublicKey;
// Tokens swapped
let mintA: Token;
let mintB: Token;
let tokenAccountA: PublicKey;
let tokenAccountB: PublicKey;

// Hard-coded fee address, for testing production mode
const SWAP_PROGRAM_OWNER_FEE_ADDRESS =
  process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;

// Pool fees
const TRADING_FEE_NUMERATOR = 25;
const TRADING_FEE_DENOMINATOR = 10000;
const OWNER_TRADING_FEE_NUMERATOR = 5;
const OWNER_TRADING_FEE_DENOMINATOR = 10000;
const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
const HOST_FEE_NUMERATOR = 20;
const HOST_FEE_DENOMINATOR = 100;

// Initial amount in each swap token
let currentSwapTokenA = 1000000;
let currentSwapTokenB = 1000000;
let currentFeeAmount = 0;

// Swap instruction constants
// Because there is no withdraw fee in the production version, these numbers
// need to get slightly tweaked in the two cases.
const SWAP_AMOUNT_IN = 100000;
const SWAP_AMOUNT_OUT = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 90661 : 90674;
const SWAP_FEE = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 22273 : 22277;
const HOST_SWAP_FEE = SWAP_PROGRAM_OWNER_FEE_ADDRESS
  ? Math.floor((SWAP_FEE * HOST_FEE_NUMERATOR) / HOST_FEE_DENOMINATOR)
  : 0;
const OWNER_SWAP_FEE = SWAP_FEE - HOST_SWAP_FEE;

// Pool token amount minted on init
const DEFAULT_POOL_TOKEN_AMOUNT = 1000000000;
// Pool token amount to withdraw / deposit
const POOL_TOKEN_AMOUNT = 10000000;

function assert(condition: boolean, message?: string) {
  if (!condition) {
    console.log(Error().stack + ':token-test.js');
    throw message || 'Assertion failed';
  }
}

let connection: Connection;
async function getConnection(): Promise<Connection> {
  if (connection) return connection;

  connection = new Connection(url, 'recent');
  console.log("----------------------------url----------------------------")
  console.log(url)
  const version = await connection.getVersion();

  console.log('Connection to cluster established:', url, version);
  return connection;
}
const mintAKey = '7d7i23QEdCP2kvVfJm3qAyJmNFiHNpNV5k7DupYMkEYM';
const mintBKey = 'HX3MWTYt3qaZ7RaXk2KiXzWGhoaCTo5gaGzY7jaedHXi';
export async function createTokenSwap(
  curveType: number,
  curveParameters?: Numberu64,
): Promise<void> {
  const connection = await getConnection();
  // const payer = await newAccountWithLamports(connection, 1000000000);
  const payer = new Account([3,252,255,110,56,235,208,96,203,90,146,236,230,41,88,76,33,28,90,90,243,88,244,103,66,96,107,224,3,45,100,136,1,131,158,171,65,176,37,87,73,246,32,42,134,115,102,220,187,43,205,32,48,227,55,20,216,162,140,204,8,48,13,62]);
  console.log('payer.publicKey :'+payer.publicKey);
  //owner = await newAccountWithLamports(connection, 1000000000);
  owner = new Account([30,72,146,239,125,42,31,114,39,254,222,19,107,128,227,49,72,67,15,179,200,44,196,47,113,215,87,244,166,62,9,64,235,22,239,76,86,188,196,67,204,110,174,27,101,236,214,15,167,127,87,199,134,29,225,207,153,255,77,181,21,103,153,190]);
  console.log('owner.publicKey :'+owner.publicKey);
  const tokenSwapAccount = new Account();
  console.log("TOKEN_SWAP_PROGRAM_ID :"+TOKEN_SWAP_PROGRAM_ID);
  console.log("[tokenSwapAccount.publicKey.toBuffer()] :"+[tokenSwapAccount.publicKey]);
  [authority, bumpSeed] = await PublicKey.findProgramAddress(
    [tokenSwapAccount.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  );
  console.log('authority :'+authority)
  console.log('bumpSeed :'+bumpSeed)
  console.log('creating pool mint');
  console.log('TOKEN_PROGRAM_ID :'+TOKEN_PROGRAM_ID);
  //Here is the code we are creating mint. In this we are adding details of payer
  tokenPool = await Token.createMint(
    connection,
    payer,
    authority,
    null,
    2,
    TOKEN_PROGRAM_ID,
  );
  console.log('--------------------------------tokenPool--------------------------------');
  console.log(tokenPool);
  console.log('creating pool account');
  tokenAccountPool = await tokenPool.createAccount(owner.publicKey);
  console.log('tokenAccountPool :'+tokenAccountPool);
  const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();
  feeAccount = await tokenPool.createAccount(new PublicKey(ownerKey));
  console.log('feeAccount :'+feeAccount);
  console.log('creating token A');
  /*mintA = await Token.createMint(
    connection,
    payer,
    owner.publicKey,
    null,
    2,
    TOKEN_PROGRAM_ID,
  );*/
  mintA = new Token(
    connection,
    new PublicKey(mintAKey),
    TOKEN_PROGRAM_ID,
    owner
  );
  console.log('--------------------------------mintA--------------------------------');
  console.log(mintA);
  console.log('creating token A account');
  tokenAccountA = await mintA.createAccount(authority);
  console.log('tokenAccountA :'+tokenAccountA);
  console.log('minting token A to swap');
  await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);

  console.log('creating token B');
  // mintB = await Token.createMint(
  //   connection,
  //   payer,
  //   owner.publicKey,
  //   null,
  //   2,
  //   TOKEN_PROGRAM_ID,
  // );
  mintB = new Token(
    connection,
    new PublicKey(mintBKey),
    TOKEN_PROGRAM_ID,
    owner
  );
  console.log('--------------------------------mintB--------------------------------');
  console.log(mintB);
  console.log('creating token B account');
  tokenAccountB = await mintB.createAccount(authority);
  console.log('tokenAccountB :'+tokenAccountB);
  console.log('minting token B to swap');
  await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);

  console.log('creating token swap');
  // const swapPayer = await newAccountWithLamports(connection, 10000000000);
  const swapPayer = owner;
  console.log('--------------------------------swapPayer--------------------------------');
  console.log(swapPayer);
  tokenSwap = await TokenSwap.createTokenSwap(
    connection,
    swapPayer,
    tokenSwapAccount,
    authority,
    tokenAccountA,
    tokenAccountB,
    tokenPool.publicKey,
    mintA.publicKey,
    mintB.publicKey,
    feeAccount,
    tokenAccountPool,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TRADING_FEE_NUMERATOR,
    TRADING_FEE_DENOMINATOR,
    OWNER_TRADING_FEE_NUMERATOR,
    OWNER_TRADING_FEE_DENOMINATOR,
    OWNER_WITHDRAW_FEE_NUMERATOR,
    OWNER_WITHDRAW_FEE_DENOMINATOR,
    HOST_FEE_NUMERATOR,
    HOST_FEE_DENOMINATOR,
    curveType,
    curveParameters,
  );
  console.log('--------------------------------tokenSwap--------------------------------')
  console.log(tokenSwap)
  console.log('loading token swap');
  const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
    connection,
    tokenSwapAccount.publicKey,
    TOKEN_SWAP_PROGRAM_ID,
    swapPayer,
  );
  console.log("fetchedTokenSwap.tokenProgramId: "+fetchedTokenSwap.tokenProgramId+" :TOKEN_PROGRAM_ID :"+TOKEN_PROGRAM_ID)
  console.log("fetchedTokenSwap.tokenAccountA: "+fetchedTokenSwap.tokenAccountA+" :tokenAccountA :"+tokenAccountA)
  console.log("fetchedTokenSwap.tokenAccountB: "+fetchedTokenSwap.tokenAccountB+" :tokenAccountB :"+tokenAccountB)
  console.log("fetchedTokenSwap.mintA: "+fetchedTokenSwap.mintA+" :mintA.publicKey :"+mintA.publicKey)
  console.log("fetchedTokenSwap.mintB: "+fetchedTokenSwap.mintB+" :mintB.publicKey :"+mintB.publicKey)
  console.log("fetchedTokenSwap.poolToken: "+fetchedTokenSwap.poolToken+" :tokenPool.publicKey :"+tokenPool.publicKey)
  console.log("fetchedTokenSwap.feeAccount: "+fetchedTokenSwap.feeAccount+" :feeAccount :"+feeAccount)
  console.log("TRADING_FEE_NUMERATOR: "+TRADING_FEE_NUMERATOR+" :fetchedTokenSwap.tradeFeeNumerator.toNumber() :"+fetchedTokenSwap.tradeFeeNumerator.toNumber())
  console.log("TRADING_FEE_DENOMINATOR: "+TRADING_FEE_DENOMINATOR+" :fetchedTokenSwap.tradeFeeDenominator.toNumber() :"+fetchedTokenSwap.tradeFeeDenominator.toNumber())
  console.log("OWNER_TRADING_FEE_NUMERATOR: "+OWNER_TRADING_FEE_NUMERATOR+" :fetchedTokenSwap.ownerTradeFeeNumerator.toNumber() :"+fetchedTokenSwap.ownerTradeFeeNumerator.toNumber())
  console.log("OWNER_TRADING_FEE_DENOMINATOR: "+OWNER_TRADING_FEE_DENOMINATOR+" :fetchedTokenSwap.ownerTradeFeeDenominator.toNumber() :"+fetchedTokenSwap.ownerTradeFeeDenominator.toNumber())
  console.log("OWNER_WITHDRAW_FEE_NUMERATOR: "+OWNER_WITHDRAW_FEE_NUMERATOR+" :fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber() :"+fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber())
  console.log("OWNER_WITHDRAW_FEE_DENOMINATOR: "+OWNER_WITHDRAW_FEE_DENOMINATOR+" :fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber() :"+fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber())
  console.log("HOST_FEE_NUMERATOR: "+HOST_FEE_NUMERATOR+" :fetchedTokenSwap.hostFeeNumerator.toNumber() :"+fetchedTokenSwap.hostFeeNumerator.toNumber())
  console.log("HOST_FEE_DENOMINATOR: "+HOST_FEE_DENOMINATOR+" :fetchedTokenSwap.hostFeeDenominator.toNumber() :"+fetchedTokenSwap.hostFeeDenominator.toNumber())
  console.log("curveType: "+curveType+" :fetchedTokenSwap.curveType :"+fetchedTokenSwap.curveType)

  assert(fetchedTokenSwap.tokenProgramId.equals(TOKEN_PROGRAM_ID));
  assert(fetchedTokenSwap.tokenAccountA.equals(tokenAccountA));
  assert(fetchedTokenSwap.tokenAccountB.equals(tokenAccountB));
  assert(fetchedTokenSwap.mintA.equals(mintA.publicKey));
  assert(fetchedTokenSwap.mintB.equals(mintB.publicKey));
  assert(fetchedTokenSwap.poolToken.equals(tokenPool.publicKey));
  assert(fetchedTokenSwap.feeAccount.equals(feeAccount));
  assert(
    TRADING_FEE_NUMERATOR == fetchedTokenSwap.tradeFeeNumerator.toNumber(),
  );
  assert(
    TRADING_FEE_DENOMINATOR == fetchedTokenSwap.tradeFeeDenominator.toNumber(),
  );
  assert(
    OWNER_TRADING_FEE_NUMERATOR ==
      fetchedTokenSwap.ownerTradeFeeNumerator.toNumber(),
  );
  assert(
    OWNER_TRADING_FEE_DENOMINATOR ==
      fetchedTokenSwap.ownerTradeFeeDenominator.toNumber(),
  );
  assert(
    OWNER_WITHDRAW_FEE_NUMERATOR ==
      fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber(),
  );
  assert(
    OWNER_WITHDRAW_FEE_DENOMINATOR ==
      fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber(),
  );
  assert(HOST_FEE_NUMERATOR == fetchedTokenSwap.hostFeeNumerator.toNumber());
  assert(
    HOST_FEE_DENOMINATOR == fetchedTokenSwap.hostFeeDenominator.toNumber(),
  );
  assert(curveType == fetchedTokenSwap.curveType);
}

/* To allow any trading, the pool needs liquidity provided from the outside.
Using the deposit_all_token_types or deposit_single_token_type_exact_amount_in instructions,
anyone can provide liquidity for others to trade,
and in exchange, depositors receive a pool token representing fractional ownership of all A and B tokens in the pool. */
export async function depositAllTokenTypes(): Promise<void> {
  const poolMintInfo = await tokenPool.getMintInfo();
  const supply = poolMintInfo.supply.toNumber();
  const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  const tokenA = Math.floor(
    (swapTokenA.amount.toNumber() * POOL_TOKEN_AMOUNT) / supply,
  );
  const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
  const tokenB = Math.floor(
    (swapTokenB.amount.toNumber() * POOL_TOKEN_AMOUNT) / supply,
  );

  const userTransferAuthority = new Account();
  console.log('Creating depositor token a account');
  const userAccountA = await mintA.createAccount(owner.publicKey);
  await mintA.mintTo(userAccountA, owner, [], tokenA);
  await mintA.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    owner,
    [],
    tokenA,
  );
  console.log('Creating depositor token b account');
  const userAccountB = await mintB.createAccount(owner.publicKey);
  await mintB.mintTo(userAccountB, owner, [], tokenB);
  await mintB.approve(
    userAccountB,
    userTransferAuthority.publicKey,
    owner,
    [],
    tokenB,
  );
  console.log('Creating depositor pool token account');
  const newAccountPool = await tokenPool.createAccount(owner.publicKey);

  console.log('Depositing into swap');
  await tokenSwap.depositAllTokenTypes(
    userAccountA,
    userAccountB,
    newAccountPool,
    userTransferAuthority,
    POOL_TOKEN_AMOUNT,
    tokenA,
    tokenB,
  );

  let info;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == 0);
  info = await mintB.getAccountInfo(userAccountB);
  assert(info.amount.toNumber() == 0);
  info = await mintA.getAccountInfo(tokenAccountA);
  assert(info.amount.toNumber() == currentSwapTokenA + tokenA);
  currentSwapTokenA += tokenA;
  info = await mintB.getAccountInfo(tokenAccountB);
  assert(info.amount.toNumber() == currentSwapTokenB + tokenB);
  currentSwapTokenB += tokenB;
  info = await tokenPool.getAccountInfo(newAccountPool);
  assert(info.amount.toNumber() == POOL_TOKEN_AMOUNT);
}

/*At any time, pool token holders may redeem their pool tokens in exchange for tokens A and B,
returned at the current "fair" rate as determined by the curve.
In the withdraw_all_token_types and withdraw_single_token_type_exact_amount_out instructions,
pool tokens are burned, and tokens A and B are transferred into the user's accounts.
*/
export async function withdrawAllTokenTypes(): Promise<void> {
  const poolMintInfo = await tokenPool.getMintInfo();
  const supply = poolMintInfo.supply.toNumber();
  let swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  let swapTokenB = await mintB.getAccountInfo(tokenAccountB);
  let feeAmount = 0;
  if (OWNER_WITHDRAW_FEE_NUMERATOR !== 0) {
    feeAmount = Math.floor(
      (POOL_TOKEN_AMOUNT * OWNER_WITHDRAW_FEE_NUMERATOR) /
        OWNER_WITHDRAW_FEE_DENOMINATOR,
    );
  }
  const poolTokenAmount = POOL_TOKEN_AMOUNT - feeAmount;
  const tokenA = Math.floor(
    (swapTokenA.amount.toNumber() * poolTokenAmount) / supply,
  );
  const tokenB = Math.floor(
    (swapTokenB.amount.toNumber() * poolTokenAmount) / supply,
  );

  console.log('Creating withdraw token A account');
  let userAccountA = await mintA.createAccount(owner.publicKey);
  console.log('Creating withdraw token B account');
  let userAccountB = await mintB.createAccount(owner.publicKey);

  const userTransferAuthority = new Account();
  console.log('Approving withdrawal from pool account');
  await tokenPool.approve(
    tokenAccountPool,
    userTransferAuthority.publicKey,
    owner,
    [],
    POOL_TOKEN_AMOUNT,
  );

  console.log('Withdrawing pool tokens for A and B tokens');
  await tokenSwap.withdrawAllTokenTypes(
    userAccountA,
    userAccountB,
    tokenAccountPool,
    userTransferAuthority,
    POOL_TOKEN_AMOUNT,
    tokenA,
    tokenB,
  );

  //const poolMintInfo = await tokenPool.getMintInfo();
  swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  swapTokenB = await mintB.getAccountInfo(tokenAccountB);

  let info = await tokenPool.getAccountInfo(tokenAccountPool);
  assert(
    info.amount.toNumber() == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT,
  );
  assert(swapTokenA.amount.toNumber() == currentSwapTokenA - tokenA);
  currentSwapTokenA -= tokenA;
  assert(swapTokenB.amount.toNumber() == currentSwapTokenB - tokenB);
  currentSwapTokenB -= tokenB;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == tokenA);
  info = await mintB.getAccountInfo(userAccountB);
  assert(info.amount.toNumber() == tokenB);
  info = await tokenPool.getAccountInfo(feeAccount);
  assert(info.amount.toNumber() == feeAmount);
  currentFeeAmount = feeAmount;
}

export async function createAccountAndSwapAtomic(): Promise<void> {
  console.log('Creating swap token a account');
  let userAccountA = await mintA.createAccount(owner.publicKey);
  await mintA.mintTo(userAccountA, owner, [], SWAP_AMOUNT_IN);

  // @ts-ignore
  const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
    connection,
  );
  const newAccount = new Account();
  const transaction = new Transaction();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: balanceNeeded,
      space: AccountLayout.span,
      programId: mintB.programId,
    }),
  );

  transaction.add(
    Token.createInitAccountInstruction(
      mintB.programId,
      mintB.publicKey,
      newAccount.publicKey,
      owner.publicKey,
    ),
  );

  const userTransferAuthority = new Account();
  transaction.add(
    Token.createApproveInstruction(
      mintA.programId,
      userAccountA,
      userTransferAuthority.publicKey,
      owner.publicKey,
      [owner],
      SWAP_AMOUNT_IN,
    ),
  );

  transaction.add(
    TokenSwap.swapInstruction(
      tokenSwap.tokenSwap,
      tokenSwap.authority,
      userTransferAuthority.publicKey,
      userAccountA,
      tokenSwap.tokenAccountA,
      tokenSwap.tokenAccountB,
      newAccount.publicKey,
      tokenSwap.poolToken,
      tokenSwap.feeAccount,
      null,
      tokenSwap.swapProgramId,
      tokenSwap.tokenProgramId,
      SWAP_AMOUNT_IN,
      0,
    ),
  );

  // Send the instructions
  console.log('sending big instruction');
  const signature = await sendAndConfirmTransaction(
    'create account, approve transfer, swap',
    connection,
    transaction,
    owner,
    newAccount,
    userTransferAuthority,
  );
  console.log('SIGNATURE', signature);
  const tran_detail = await connection.getParsedConfirmedTransaction(signature, 'confirmed')
  console.log('tran_detail');
  console.log(tran_detail);
  let info;
  info = await mintA.getAccountInfo(tokenAccountA);
  currentSwapTokenA = info.amount.toNumber();
  info = await mintB.getAccountInfo(tokenAccountB);
  currentSwapTokenB = info.amount.toNumber();
}

// Once a pool is created, users can immediately begin trading on it using the swap instruction.
export async function swap(): Promise<void> {
  console.log('Creating swap token a account');
  let userAccountA = await mintA.createAccount(owner.publicKey);
  await mintA.mintTo(userAccountA, owner, [], SWAP_AMOUNT_IN);
  const userTransferAuthority = new Account();
  await mintA.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    owner,
    [],
    SWAP_AMOUNT_IN,
  );
  console.log('Creating swap token b account');
  let userAccountB = await mintB.createAccount(owner.publicKey);
  let poolAccount = SWAP_PROGRAM_OWNER_FEE_ADDRESS
    ? await tokenPool.createAccount(owner.publicKey)
    : null;

  console.log('Swapping');
  await tokenSwap.swap(
    userAccountA,
    tokenAccountA,
    tokenAccountB,
    userAccountB,
    poolAccount,
    userTransferAuthority,
    SWAP_AMOUNT_IN,
    SWAP_AMOUNT_OUT,
  );

  await sleep(500);

  let info;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == 0);

  info = await mintB.getAccountInfo(userAccountB);
  assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

  info = await mintA.getAccountInfo(tokenAccountA);
  assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
  currentSwapTokenA += SWAP_AMOUNT_IN;

  info = await mintB.getAccountInfo(tokenAccountB);
  assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
  currentSwapTokenB -= SWAP_AMOUNT_OUT;

  info = await tokenPool.getAccountInfo(tokenAccountPool);
  assert(
    info.amount.toNumber() == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT,
  );

  info = await tokenPool.getAccountInfo(feeAccount);
  assert(info.amount.toNumber() == currentFeeAmount + OWNER_SWAP_FEE);

  if (poolAccount != null) {
    info = await tokenPool.getAccountInfo(poolAccount);
    assert(info.amount.toNumber() == HOST_SWAP_FEE);
  }
}

function tradingTokensToPoolTokens(
  sourceAmount: number,
  swapSourceAmount: number,
  poolAmount: number,
): number {
  const tradingFee =
    (sourceAmount / 2) * (TRADING_FEE_NUMERATOR / TRADING_FEE_DENOMINATOR);
  const sourceAmountPostFee = sourceAmount - tradingFee;
  const root = Math.sqrt(sourceAmountPostFee / swapSourceAmount + 1);
  return Math.floor(poolAmount * (root - 1));
}

export async function depositSingleTokenTypeExactAmountIn(): Promise<void> {
  // Pool token amount to deposit on one side
  const depositAmount = 10000;

  const poolMintInfo = await tokenPool.getMintInfo();
  const supply = poolMintInfo.supply.toNumber();
  const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  const poolTokenA = tradingTokensToPoolTokens(
    depositAmount,
    swapTokenA.amount.toNumber(),
    supply,
  );
  const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
  const poolTokenB = tradingTokensToPoolTokens(
    depositAmount,
    swapTokenB.amount.toNumber(),
    supply,
  );

  const userTransferAuthority = new Account();
  console.log('Creating depositor token a account');
  const userAccountA = await mintA.createAccount(owner.publicKey);
  await mintA.mintTo(userAccountA, owner, [], depositAmount);
  await mintA.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    owner,
    [],
    depositAmount,
  );
  console.log('Creating depositor token b account');
  const userAccountB = await mintB.createAccount(owner.publicKey);
  await mintB.mintTo(userAccountB, owner, [], depositAmount);
  await mintB.approve(
    userAccountB,
    userTransferAuthority.publicKey,
    owner,
    [],
    depositAmount,
  );
  console.log('Creating depositor pool token account');
  const newAccountPool = await tokenPool.createAccount(owner.publicKey);

  console.log('Depositing token A into swap');
  await tokenSwap.depositSingleTokenTypeExactAmountIn(
    userAccountA,
    newAccountPool,
    userTransferAuthority,
    depositAmount,
    poolTokenA,
  );

  let info;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == 0);
  info = await mintA.getAccountInfo(tokenAccountA);
  assert(info.amount.toNumber() == currentSwapTokenA + depositAmount);
  currentSwapTokenA += depositAmount;

  console.log('Depositing token B into swap');
  await tokenSwap.depositSingleTokenTypeExactAmountIn(
    userAccountB,
    newAccountPool,
    userTransferAuthority,
    depositAmount,
    poolTokenB,
  );

  info = await mintB.getAccountInfo(userAccountB);
  assert(info.amount.toNumber() == 0);
  info = await mintB.getAccountInfo(tokenAccountB);
  assert(info.amount.toNumber() == currentSwapTokenB + depositAmount);
  currentSwapTokenB += depositAmount;
  info = await tokenPool.getAccountInfo(newAccountPool);
  assert(info.amount.toNumber() >= poolTokenA + poolTokenB);
}

export async function withdrawSingleTokenTypeExactAmountOut(): Promise<void> {
  // Pool token amount to withdraw on one side
  const withdrawAmount = 50000;
  const roundingAmount = 1.0001; // make math a little easier

  const poolMintInfo = await tokenPool.getMintInfo();
  const supply = poolMintInfo.supply.toNumber();

  const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  const swapTokenAPost = swapTokenA.amount.toNumber() - withdrawAmount;
  const poolTokenA = tradingTokensToPoolTokens(
    withdrawAmount,
    swapTokenAPost,
    supply,
  );
  let adjustedPoolTokenA = poolTokenA * roundingAmount;
  if (OWNER_WITHDRAW_FEE_NUMERATOR !== 0) {
    adjustedPoolTokenA *=
      1 + OWNER_WITHDRAW_FEE_NUMERATOR / OWNER_WITHDRAW_FEE_DENOMINATOR;
  }

  const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
  const swapTokenBPost = swapTokenB.amount.toNumber() - withdrawAmount;
  const poolTokenB = tradingTokensToPoolTokens(
    withdrawAmount,
    swapTokenBPost,
    supply,
  );
  let adjustedPoolTokenB = poolTokenB * roundingAmount;
  if (OWNER_WITHDRAW_FEE_NUMERATOR !== 0) {
    adjustedPoolTokenB *=
      1 + OWNER_WITHDRAW_FEE_NUMERATOR / OWNER_WITHDRAW_FEE_DENOMINATOR;
  }

  const userTransferAuthority = new Account();
  console.log('Creating withdraw token a account');
  const userAccountA = await mintA.createAccount(owner.publicKey);
  console.log('Creating withdraw token b account');
  const userAccountB = await mintB.createAccount(owner.publicKey);
  console.log('Creating withdraw pool token account');
  const poolAccount = await tokenPool.getAccountInfo(tokenAccountPool);
  const poolTokenAmount = poolAccount.amount.toNumber();
  await tokenPool.approve(
    tokenAccountPool,
    userTransferAuthority.publicKey,
    owner,
    [],
    adjustedPoolTokenA + adjustedPoolTokenB,
  );

  console.log('Withdrawing token A only');
  await tokenSwap.withdrawSingleTokenTypeExactAmountOut(
    userAccountA,
    tokenAccountPool,
    userTransferAuthority,
    withdrawAmount,
    adjustedPoolTokenA,
  );

  let info;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == withdrawAmount);
  info = await mintA.getAccountInfo(tokenAccountA);
  assert(info.amount.toNumber() == currentSwapTokenA - withdrawAmount);
  currentSwapTokenA += withdrawAmount;
  info = await tokenPool.getAccountInfo(tokenAccountPool);
  assert(info.amount.toNumber() >= poolTokenAmount - adjustedPoolTokenA);

  console.log('Withdrawing token B only');
  await tokenSwap.withdrawSingleTokenTypeExactAmountOut(
    userAccountB,
    tokenAccountPool,
    userTransferAuthority,
    withdrawAmount,
    adjustedPoolTokenB,
  );

  info = await mintB.getAccountInfo(userAccountB);
  assert(info.amount.toNumber() == withdrawAmount);
  info = await mintB.getAccountInfo(tokenAccountB);
  assert(info.amount.toNumber() == currentSwapTokenB - withdrawAmount);
  currentSwapTokenB += withdrawAmount;
  info = await tokenPool.getAccountInfo(tokenAccountPool);
  assert(
    info.amount.toNumber() >=
      poolTokenAmount - adjustedPoolTokenA - adjustedPoolTokenB,
  );
}
