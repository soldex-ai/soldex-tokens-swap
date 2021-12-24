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

let publicKey: PublicKey;

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
  const version = await connection.getVersion();

  console.log('Connection to cluster established:', url, version);
  return connection;
}

export async function createTokenSwap(
  curveType: number,
  curveParameters?: Numberu64,
): Promise<void> {
  const connection = await getConnection();
  console.log("Into Create Token Swap");
  // const payer = await newAccountWithLamports(connection, 1000000000);
  const payer = {publicKey:'GeGed5XgDf89fTnET8wq7YjXJUeqA53ECypckBvfZyrG'};
  console.log('payer.publicKey :'+payer.publicKey);
  // console.log('payer.secretKey :'+payer.secretKey);
  console.log('payer.publicKey :'+payer);

  //code to get Payer account Info
  const payerInfo = await connection.getAccountInfo(payer.publicKey, 'confirmed');
  console.log("payerInfo : ");
  console.log(payerInfo);

  // //code to get Payer account Balacne
  // const payerBalance = await connection.getBalance(payer.publicKey, 'confirmed')
  // console.log("payerBalance : ")
  // console.log(payerBalance)

  // owner = await newAccountWithLamports(connection, 1000000000);
  // console.log('owner.publicKey :'+owner.publicKey);
  
  // //code to get owner account Info
  // const ownerInfo = await connection.getAccountInfo(owner.publicKey, 'confirmed');
  // console.log("ownerInfo : ");
  // console.log(ownerInfo);

  // //code to get owner account Balacne
  // const ownerBalance = await connection.getBalance(owner.publicKey, 'confirmed');
  // console.log("ownerBalance : ");
  // console.log(ownerBalance);

  // const tokenSwapAccount = new Account();
  // console.log("TOKEN_SWAP_PROGRAM_ID :"+TOKEN_SWAP_PROGRAM_ID);
  // console.log("[tokenSwapAccount.publicKey.toBuffer()] :"+[tokenSwapAccount.publicKey]);
  
  // //code to get tokenSwapAccount account Info
  // const tokenSwapAccountInfo = await connection.getAccountInfo(tokenSwapAccount.publicKey, 'confirmed');
  // console.log("tokenSwapAccountInfo : ");
  // console.log(tokenSwapAccountInfo);

  // [authority, bumpSeed] = await PublicKey.findProgramAddress(
  //   [tokenSwapAccount.publicKey.toBuffer()],
  //   TOKEN_SWAP_PROGRAM_ID,
  // );
  // console.log('authority :'+authority)
  // console.log('bumpSeed :'+bumpSeed)
  // console.log('creating pool mint');
  // console.log('TOKEN_PROGRAM_ID :'+TOKEN_PROGRAM_ID);
  // //Here is the code we are creating mint. In this we are adding details of payer
  // tokenPool = await Token.createMint(
  //   connection,
  //   payer,
  //   authority,
  //   null,
  //   2,
  //   TOKEN_PROGRAM_ID,
  // );
  // console.log('--------------------------------tokenPool--------------------------------');
  // console.log(tokenPool);
  
  // //code to get tokenSwapAccount account Info
  // const tokenPoolInfo = await connection.getAccountInfo(tokenPool.publicKey, 'confirmed');
  // console.log("tokenPoolInfo : ");
  // console.log(tokenPoolInfo);

  // console.log('creating pool account');
  
  // tokenAccountPool = await tokenPool.createAccount(owner.publicKey);
  // console.log('tokenAccountPool :'+tokenAccountPool);
  // //Code to get token account balance info
  // const tokenAccountPoolBalance = await connection.getTokenAccountBalance(tokenAccountPool);
  // console.log("tokenAccountPool address: ", tokenAccountPoolBalance)

  // const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();
  // feeAccount = await tokenPool.createAccount(new PublicKey(ownerKey));
  // console.log('feeAccount :'+feeAccount);
  
  // //code to get tokenSwapAccount account Info
  // const feeAccountInfo = await connection.getAccountInfo(feeAccount, 'confirmed');
  // console.log("feeAccountInfo : ");
  // console.log(feeAccountInfo);

  // console.log('creating token A');
  // mintA = await Token.createMint(
  //   connection,
  //   payer,
  //   owner.publicKey,
  //   null,
  //   2,
  //   TOKEN_PROGRAM_ID,
  // );
  // console.log('--------------------------------mintA--------------------------------');
  // console.log(mintA);

  // //code to get tokenSwapAccount account Info
  // const mintAInfo = await connection.getAccountInfo(mintA.publicKey, 'confirmed');
  // console.log("mintAInfo : ");
  // console.log(mintAInfo);

  // console.log('creating token A account');
  // tokenAccountA = await mintA.createAccount(authority);
  // console.log('tokenAccountA :'+tokenAccountA);

  // //Code to get tokenAccountA token account balance info
  // const tokenAccountABalance = await connection.getTokenAccountBalance(tokenAccountA);
  // console.log("tokenAccountABalance address: ", tokenAccountABalance)

  // console.log('minting token A to swap');
  // await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);

  // //Code to get tokenAccountA token account balance info
  // const tokenAccountABalanceAfterMint = await connection.getTokenAccountBalance(tokenAccountA);
  // console.log("tokenAccountABalanceAfterMint address: ", tokenAccountABalanceAfterMint)


  // console.log('creating token B');
  // mintB = await Token.createMint(
  //   connection,
  //   payer,
  //   owner.publicKey,
  //   null,
  //   2,
  //   TOKEN_PROGRAM_ID,
  // );
  // console.log('--------------------------------mintB--------------------------------');
  // console.log(mintB);

  // //code to get mintB Account account Info
  // const mintBInfo = await connection.getAccountInfo(mintB.publicKey, 'confirmed');
  // console.log("mintBInfo : ");
  // console.log(mintBInfo);
 
  // console.log('creating token B account');
  // tokenAccountB = await mintB.createAccount(authority);
  // console.log('tokenAccountB :'+tokenAccountB);
  
  // //Code to get tokenAccountA token account balance info
  // const tokenAccountBBalance = await connection.getTokenAccountBalance(tokenAccountB);
  // console.log("tokenAccountBBalance address: ", tokenAccountBBalance);

  // console.log('minting token B to swap');
  // await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);

  // //Code to get tokenAccountA token account balance info
  // const tokenAccountBBalanceAfterMint = await connection.getTokenAccountBalance(tokenAccountB);
  // console.log("tokenAccountBBalanceAfterMint address: ", tokenAccountBBalanceAfterMint);

  // console.log('creating token swap');
  // const swapPayer = await newAccountWithLamports(connection, 10000000000);
  // console.log('--------------------------------swapPayer--------------------------------');
  // console.log(swapPayer);
  // tokenSwap = await TokenSwap.createTokenSwap(
  //   connection,
  //   swapPayer,
  //   tokenSwapAccount,
  //   authority,
  //   tokenAccountA,
  //   tokenAccountB,
  //   tokenPool.publicKey,
  //   mintA.publicKey,
  //   mintB.publicKey,
  //   feeAccount,
  //   tokenAccountPool,
  //   TOKEN_SWAP_PROGRAM_ID,
  //   TOKEN_PROGRAM_ID,
  //   TRADING_FEE_NUMERATOR,
  //   TRADING_FEE_DENOMINATOR,
  //   OWNER_TRADING_FEE_NUMERATOR,
  //   OWNER_TRADING_FEE_DENOMINATOR,
  //   OWNER_WITHDRAW_FEE_NUMERATOR,
  //   OWNER_WITHDRAW_FEE_DENOMINATOR,
  //   HOST_FEE_NUMERATOR,
  //   HOST_FEE_DENOMINATOR,
  //   curveType,
  //   curveParameters,
  // );
  // console.log('--------------------------------tokenSwap--------------------------------')
  // console.log(tokenSwap)
  // console.log('loading token swap');
  
  // const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
  //   connection,
  //   tokenSwapAccount.publicKey,
  //   TOKEN_SWAP_PROGRAM_ID,
  //   swapPayer,
  // );
  
  // console.log("fetchedTokenSwap.tokenProgramId: "+fetchedTokenSwap.tokenProgramId+" :TOKEN_PROGRAM_ID :"+TOKEN_PROGRAM_ID)
  // console.log("fetchedTokenSwap.tokenAccountA: "+fetchedTokenSwap.tokenAccountA+" :tokenAccountA :"+tokenAccountA)
  // console.log("fetchedTokenSwap.tokenAccountB: "+fetchedTokenSwap.tokenAccountB+" :tokenAccountB :"+tokenAccountB)
  // console.log("fetchedTokenSwap.mintA: "+fetchedTokenSwap.mintA+" :mintA.publicKey :"+mintA.publicKey)
  // console.log("fetchedTokenSwap.mintB: "+fetchedTokenSwap.mintB+" :mintB.publicKey :"+mintB.publicKey)
  // console.log("fetchedTokenSwap.poolToken: "+fetchedTokenSwap.poolToken+" :tokenPool.publicKey :"+tokenPool.publicKey)
  // console.log("fetchedTokenSwap.feeAccount: "+fetchedTokenSwap.feeAccount+" :feeAccount :"+feeAccount)
  // console.log("TRADING_FEE_NUMERATOR: "+TRADING_FEE_NUMERATOR+" :fetchedTokenSwap.tradeFeeNumerator.toNumber() :"+fetchedTokenSwap.tradeFeeNumerator.toNumber())
  // console.log("TRADING_FEE_DENOMINATOR: "+TRADING_FEE_DENOMINATOR+" :fetchedTokenSwap.tradeFeeDenominator.toNumber() :"+fetchedTokenSwap.tradeFeeDenominator.toNumber())
  // console.log("OWNER_TRADING_FEE_NUMERATOR: "+OWNER_TRADING_FEE_NUMERATOR+" :fetchedTokenSwap.ownerTradeFeeNumerator.toNumber() :"+fetchedTokenSwap.ownerTradeFeeNumerator.toNumber())
  // console.log("OWNER_TRADING_FEE_DENOMINATOR: "+OWNER_TRADING_FEE_DENOMINATOR+" :fetchedTokenSwap.ownerTradeFeeDenominator.toNumber() :"+fetchedTokenSwap.ownerTradeFeeDenominator.toNumber())
  // console.log("OWNER_WITHDRAW_FEE_NUMERATOR: "+OWNER_WITHDRAW_FEE_NUMERATOR+" :fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber() :"+fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber())
  // console.log("OWNER_WITHDRAW_FEE_DENOMINATOR: "+OWNER_WITHDRAW_FEE_DENOMINATOR+" :fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber() :"+fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber())
  // console.log("HOST_FEE_NUMERATOR: "+HOST_FEE_NUMERATOR+" :fetchedTokenSwap.hostFeeNumerator.toNumber() :"+fetchedTokenSwap.hostFeeNumerator.toNumber())
  // console.log("HOST_FEE_DENOMINATOR: "+HOST_FEE_DENOMINATOR+" :fetchedTokenSwap.hostFeeDenominator.toNumber() :"+fetchedTokenSwap.hostFeeDenominator.toNumber())
  // console.log("curveType: "+curveType+" :fetchedTokenSwap.curveType :"+fetchedTokenSwap.curveType)
  
  // assert(fetchedTokenSwap.tokenProgramId.equals(TOKEN_PROGRAM_ID));
  // assert(fetchedTokenSwap.tokenAccountA.equals(tokenAccountA));
  // assert(fetchedTokenSwap.tokenAccountB.equals(tokenAccountB));
  // assert(fetchedTokenSwap.mintA.equals(mintA.publicKey));
  // assert(fetchedTokenSwap.mintB.equals(mintB.publicKey));
  // assert(fetchedTokenSwap.poolToken.equals(tokenPool.publicKey));
  // assert(fetchedTokenSwap.feeAccount.equals(feeAccount));
  // assert(
  //   TRADING_FEE_NUMERATOR == fetchedTokenSwap.tradeFeeNumerator.toNumber(),
  // );
  // assert(
  //   TRADING_FEE_DENOMINATOR == fetchedTokenSwap.tradeFeeDenominator.toNumber(),
  // );
  // assert(
  //   OWNER_TRADING_FEE_NUMERATOR ==
  //     fetchedTokenSwap.ownerTradeFeeNumerator.toNumber(),
  // );
  // assert(
  //   OWNER_TRADING_FEE_DENOMINATOR ==
  //     fetchedTokenSwap.ownerTradeFeeDenominator.toNumber(),
  // );
  // assert(
  //   OWNER_WITHDRAW_FEE_NUMERATOR ==
  //     fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber(),
  // );
  // assert(
  //   OWNER_WITHDRAW_FEE_DENOMINATOR ==
  //     fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber(),
  // );
  // assert(HOST_FEE_NUMERATOR == fetchedTokenSwap.hostFeeNumerator.toNumber());
  // assert(
  //   HOST_FEE_DENOMINATOR == fetchedTokenSwap.hostFeeDenominator.toNumber(),
  // );
  // assert(curveType == fetchedTokenSwap.curveType);
}

export async function depositAllTokenTypes(): Promise<void> {
  const poolMintInfo = await tokenPool.getMintInfo();
  console.log('--------------------------poolMintInfo--------------------------')
  console.log(poolMintInfo)

  const supply = poolMintInfo.supply.toNumber();
  console.log('--------------------------supply--------------------------')
  console.log(supply)

  const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
  const tokenA = Math.floor(
    (swapTokenA.amount.toNumber() * POOL_TOKEN_AMOUNT) / supply,
  );

  console.log('--------------------------tokenA--------------------------')
  console.log(tokenA)

  const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
  const tokenB = Math.floor(
    (swapTokenB.amount.toNumber() * POOL_TOKEN_AMOUNT) / supply,
  );

  console.log('--------------------------tokenB--------------------------')
  console.log(tokenB)

  const userTransferAuthority = new Account();
  console.log('Creating depositor token a account');
  const userAccountA = await mintA.createAccount(owner.publicKey);
  
  //Code to get userAccountA token account balance info
  const userAccountABalance = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalance address: ", userAccountABalance)
  
  await mintA.mintTo(userAccountA, owner, [], tokenA);
  
  //Code to get userAccountA token account balance info
  const userAccountABalanceAfterMint = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceAfterMint address: ", userAccountABalanceAfterMint)

  await mintA.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    owner,
    [],
    tokenA,
  );
  
  //Code to get userAccountA token account balance info
  const userAccountABalanceAfterMintApprove = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceAfterMintApprove address: ", userAccountABalanceAfterMintApprove)

  console.log('Creating depositor token b account');
  const userAccountB = await mintB.createAccount(owner.publicKey);
  
  //Code to get userAccountB token account balance info
  const userAccountBBalance = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalance address: ", userAccountBBalance)

  await mintB.mintTo(userAccountB, owner, [], tokenB);
  
  //Code to get userAccountBBalanceAfterMint token account balance info
  const userAccountBBalanceAfterMint = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceAfterMint address: ", userAccountBBalanceAfterMint)
  
  await mintB.approve(
    userAccountB,
    userTransferAuthority.publicKey,
    owner,
    [],
    tokenB,
  );

  //Code to get userAccountBBalanceAfterMint token account balance info
  const userAccountBBalanceAfterMintApprove = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceAfterMintApprove address: ", userAccountBBalanceAfterMintApprove);

  console.log('Creating depositor pool token account');
  const newAccountPool = await tokenPool.createAccount(owner.publicKey);

  //Code to get newAccountPool token account balance info
  const newAccountPoolBalance = await connection.getTokenAccountBalance(newAccountPool);
  console.log("newAccountPoolBalance address: ", newAccountPoolBalance);

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

  //Code to get newAccountPool token account balance info
  const userAccountABalanceAfterDeposit = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceAfterDeposit address: ", userAccountABalanceAfterDeposit);

  //Code to get newAccountPool token account balance info
  const userAccountBBalanceAfterDeposit = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceAfterDeposit address: ", userAccountBBalanceAfterDeposit);

  //Code to get newAccountPool token account balance info
  const newAccountPoolBalanceAfterDeposit = await connection.getTokenAccountBalance(newAccountPool);
  console.log("newAccountPoolBalanceAfterDeposit address: ", newAccountPoolBalanceAfterDeposit);

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
  const tran_detail = await connection.getTransaction(signature)
  console.log('tran_detail');
  console.log(tran_detail);
  let info;
  info = await mintA.getAccountInfo(tokenAccountA);
  currentSwapTokenA = info.amount.toNumber();
  info = await mintB.getAccountInfo(tokenAccountB);
  currentSwapTokenB = info.amount.toNumber();
}

export async function swap(): Promise<void> {
  console.log('Creating swap token a account');
  let userAccountA = await mintA.createAccount(owner.publicKey);
  
  //Code to get userAccountABalanceSwap token account balance info
  const userAccountABalanceSwap = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceSwap address: ", userAccountABalanceSwap);
  
  //Code to get userAccountABalanceSwap token account balance info
  const ownerpublicKeyBalanceBeforeMintSwap = await connection.getAccountInfo(owner.publicKey);
  console.log("ownerpublicKeyBalanceBeforeMintSwap address: ", ownerpublicKeyBalanceBeforeMintSwap);
  
  await mintA.mintTo(userAccountA, owner, [], SWAP_AMOUNT_IN);

  //Code to get userAccountABalanceSwap token account balance info
  const ownerpublicKeyBalanceAfterMintSwap = await connection.getAccountInfo(owner.publicKey);
  console.log("ownerpublicKeyBalanceAfterMintSwap address: ", ownerpublicKeyBalanceAfterMintSwap);

  //Code to get userAccountABalanceSwap token account balance info
  const userAccountABalanceAfterMintSwap = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceAfterMintSwap address: ", userAccountABalanceAfterMintSwap);

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

  //Code to get userAccountBBalanceSwap token account balance info
  let userAccountBBalanceSwap = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceSwap address: ", userAccountBBalanceSwap);

  //Code to get userAccountABalanceBeforeSwap token account balance info
  let userAccountABalanceBeforeSwap = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceBeforeSwap address: ", userAccountABalanceBeforeSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let tokenAccountABalanceBeforeSwap = await connection.getTokenAccountBalance(tokenAccountA);
  console.log("tokenAccountABalanceBeforeSwap address: ", tokenAccountABalanceBeforeSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let tokenAccountBBalanceBeforeSwap = await connection.getTokenAccountBalance(tokenAccountB);
  console.log("tokenAccountBBalanceBeforeSwap address: ", tokenAccountBBalanceBeforeSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let userAccountBBalanceBeforeSwap = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceBeforeSwap address: ", userAccountBBalanceBeforeSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  // let poolAccountBalanceBeforeSwap = await connection.getTokenAccountBalance(poolAccount);
  // console.log("poolAccountBalanceBeforeSwap address: ", poolAccountBalanceBeforeSwap);

  //Code to get SWAP_AMOUNT_IN token account balance info
  console.log("SWAP_AMOUNT_IN address: ", SWAP_AMOUNT_IN);

  //Code to get SWAP_AMOUNT_OUT token account balance info
  console.log("SWAP_AMOUNT_OUT address: ", SWAP_AMOUNT_OUT);

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

  //Code to get userAccountABalanceBeforeSwap token account balance info
  let userAccountABalanceAfterSwap = await connection.getTokenAccountBalance(userAccountA);
  console.log("userAccountABalanceAfterSwap address: ", userAccountABalanceAfterSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let tokenAccountABalanceAfterSwap = await connection.getTokenAccountBalance(tokenAccountA);
  console.log("tokenAccountABalanceAfterSwap address: ", tokenAccountABalanceAfterSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let tokenAccountBBalanceAfterSwap = await connection.getTokenAccountBalance(tokenAccountB);
  console.log("tokenAccountBBalanceAfterSwap address: ", tokenAccountBBalanceAfterSwap);

  //Code to get tokenAccountABalanceBeforeSwap token account balance info
  let userAccountBBalanceAfterSwap = await connection.getTokenAccountBalance(userAccountB);
  console.log("userAccountBBalanceAfterSwap address: ", userAccountBBalanceAfterSwap);

  // Code to get tokenAccountABalanceBeforeSwap token account balance info
  // let poolAccountBalanceAfterSwap = await connection.getTokenAccountBalance(poolAccount);
  // console.log("poolAccountBalanceAfterSwap address: ", poolAccountBalanceAfterSwap);

  //Code to get SWAP_AMOUNT_IN token account balance info
  console.log("SWAP_AMOUNT_IN address: ", SWAP_AMOUNT_IN);

  //Code to get SWAP_AMOUNT_OUT token account balance info
  console.log("SWAP_AMOUNT_OUT address: ", SWAP_AMOUNT_OUT);

  let info;
  info = await mintA.getAccountInfo(userAccountA);
  assert(info.amount.toNumber() == 0);

  info = await mintB.getAccountInfo(userAccountB);
  console.log('info.amount.toNumber()')
  console.log(info.amount.toNumber())
  // assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

  // info = await mintA.getAccountInfo(tokenAccountA);
  // assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
  // currentSwapTokenA += SWAP_AMOUNT_IN;

  // info = await mintB.getAccountInfo(tokenAccountB);
  // assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
  // currentSwapTokenB -= SWAP_AMOUNT_OUT;

  // info = await tokenPool.getAccountInfo(tokenAccountPool);
  // assert(
  //   info.amount.toNumber() == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT,
  // );

  // info = await tokenPool.getAccountInfo(feeAccount);
  // assert(info.amount.toNumber() == currentFeeAmount + OWNER_SWAP_FEE);

  // if (poolAccount != null) {
  //   info = await tokenPool.getAccountInfo(poolAccount);
  //   assert(info.amount.toNumber() == HOST_SWAP_FEE);
  // }
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
