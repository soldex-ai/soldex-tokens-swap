import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';

import {TokenSwap, CurveType, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout} from '../src';
import {sendAndConfirmTransaction} from '../src/util/send-and-confirm-transaction';
import {newAccountWithLamports} from '../src/util/new-account-with-lamports';
import {url} from '../src/util/url';
import {sleep} from '../src/util/sleep';
import {Numberu64} from '../dist';
import { swap } from './token-swap-script';

export interface FeeParams {
  tradeFeeNumerator: number;
  tradeFeeDenominator: number;
  ownerTradeFeeNumerator: number;
  ownerTradeFeeDenominator: number;
  ownerWithdrawFeeNumerator: number;
  ownerWithdrawFeeDenominator: number;
  hostFeeNumerator: number;
  hostFeeDenominator: number;
}
export interface TokenProvideInfo{
  mint: PublicKey,
  amount: number,
  account: PublicKey,
}
// export async function getFilteredTokenAccountsByOwner(
//   connection: Connection,
//   programId: PublicKey,
//   mint: PublicKey
// ): Promise<{ context: {}; value: [] }> {
//   // @ts-ignore
//   const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
//     programId.toBase58(),
//     {
//       mint: mint.toBase58()
//     },
//     {
//       encoding: 'jsonParsed'
//     }
//   ])
//   if (resp.error) {
//     throw new Error(resp.error.message)
//   }
//   return resp.result
// }
// export async function getOneFilteredTokenAccountsByOwner(  connection: Connection,
//   owner: PublicKey,
//   mint: PublicKey
// ): Promise<string|null> {
//   try{
//     const tokenAccountList1 = await getFilteredTokenAccountsByOwner(connection, owner, mint)
//     const tokenAccountList: any = tokenAccountList1.value.map((item: any) => {
//         return item.pubkey
//     })
//     let tokenAccount
//     for (const item of tokenAccountList) {
//       if (item !== null) {
//         tokenAccount = item
//       }
//     }
//     return tokenAccount
//   }
//   catch{
//     return null
//   }

// }

export async function createPoolWithKeypair(
  connection: Connection,
  swapPayer: Account,
  baseInfo: TokenProvideInfo,
  quoteInfo: TokenProvideInfo,

  lpMintDecimals: number,

  fees: FeeParams,
  feeOwner: PublicKey,

  curveType: number,
  curveParameters?: Numberu64,
) {
  const tokenSwapAccount = new Account();
  const [authority, bumpSeed] = await PublicKey.findProgramAddress(
    [tokenSwapAccount.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  );
  const baseToken = new Token(
    connection,
    baseInfo.mint,
    TOKEN_PROGRAM_ID,
    swapPayer,
  );
  const quoteToken = new Token(
    connection,
    quoteInfo.mint,
    TOKEN_PROGRAM_ID,
    swapPayer,
  );

  console.log('authority', authority.toBase58());
  console.log('tokenSwapAccount', tokenSwapAccount.publicKey.toBase58());

  // const tokenAccountA = await baseToken.createAssociatedTokenAccount(authority);
  // const tokenAccountB = await quoteToken.createAssociatedTokenAccount(authority);

  let transaction = new Transaction();


  const tokenAccountA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    baseInfo.mint,
    authority,
    true
  );
  const tokenAccountB = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    quoteInfo.mint,
    authority,
    true
  );

  transaction.add(Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    baseInfo.mint,
    tokenAccountA,
    authority,
    swapPayer.publicKey
  ));

  transaction.add(Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    quoteInfo.mint,
    tokenAccountB,
    authority,
    swapPayer.publicKey
  ));

  let tx = await connection.sendTransaction(transaction, [swapPayer], { skipPreflight: true });
  await connection.confirmTransaction(tx);

  console.log('sent transaction', tx);

  console.log('tokenAccountA', tokenAccountA.toBase58());
  console.log('tokenAccountB', tokenAccountB.toBase58());

  console.log('A balance', await connection.getTokenAccountBalance(tokenAccountA));
  console.log('B balance', await connection.getTokenAccountBalance(tokenAccountB));

  await baseToken.transfer(baseInfo.account, tokenAccountA, swapPayer, [], baseInfo.amount);
  await quoteToken.transfer(quoteInfo.account, tokenAccountB, swapPayer, [], quoteInfo.amount);

  const tokenPool = await Token.createMint(
    connection,
    swapPayer,
    authority,
    null,
    lpMintDecimals,
    TOKEN_PROGRAM_ID,
  );

  const tokenAccountPool = await tokenPool.createAccount(swapPayer.publicKey);
  const feeAccount = await tokenPool.createAccount(feeOwner);

  console.log('calling createTokenSwap');

  const tokenSwap = await TokenSwap.createTokenSwap(
    connection,
    swapPayer,
    tokenSwapAccount,
    authority,
    tokenAccountA,
    tokenAccountB,
    tokenPool.publicKey,
    baseInfo.mint,
    quoteInfo.mint,
    feeAccount,
    tokenAccountPool,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    fees.tradeFeeNumerator,
    fees.tradeFeeDenominator,
    fees.ownerTradeFeeNumerator,
    fees.ownerTradeFeeDenominator,
    fees.ownerWithdrawFeeNumerator,
    fees.ownerWithdrawFeeDenominator,
    fees.hostFeeNumerator,
    fees.hostFeeDenominator,
    curveType,
    curveParameters,
  );
  return tokenSwap;
}

export async function getPools(
  connection: Connection
):Promise<TokenSwap[]> {
  let pools:TokenSwap[] = [];
  (await connection.getProgramAccounts(TOKEN_SWAP_PROGRAM_ID))
    .filter((item) => item.account.data.length === TokenSwapLayout.span)
    .map((item) => {
      // let result = {
      //   data: TokenSwapLayout.decode(item.account.data) as TokenSwap,
      //   account: item.account,
      //   pubkey: item.pubkey,
      //   init: async () => {},
      // };

      // TokenSwap.loadTokenSwap(connection, new PublicKey(''), TOKEN_SWAP_PROGRAM_ID, swapPayer);

      pools.push(TokenSwapLayout.decode(item.account.data) as TokenSwap);
      console.log('item', TokenSwapLayout.decode(item.account.data) as TokenSwap)

    });
  return pools;
}