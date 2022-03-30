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

async function createTokenSwap() {
    console.log('Run test: createTokenSwap (constant price)');
    const connection = await getConnection();

    // let swapPayer = await newAccountWithLamports(connection, 1000000000);
    // let feeOwner = (await newAccountWithLamports(connection, 1000000000)).publicKey;

    console.log( 'swapPayer.publicKey :' + swapPayer.publicKey.toBase58() );
    console.log( 'feeOwner:' + feeOwner.publicKey.toBase58() );
    let lpMintDecimals = 9;
    let fees:FeeParams = {
        tradeFeeDenominator: TRADING_FEE_DENOMINATOR,
        tradeFeeNumerator: TRADING_FEE_NUMERATOR,
        ownerTradeFeeNumerator: OWNER_TRADING_FEE_NUMERATOR,
        ownerTradeFeeDenominator: OWNER_TRADING_FEE_DENOMINATOR,
        ownerWithdrawFeeNumerator: OWNER_WITHDRAW_FEE_NUMERATOR,
        ownerWithdrawFeeDenominator: OWNER_WITHDRAW_FEE_DENOMINATOR,
        hostFeeNumerator: HOST_FEE_NUMERATOR,
        hostFeeDenominator: HOST_FEE_DENOMINATOR
    };

    // let mintA = await Token.createMint(
    //     connection,
    //     swapPayer,
    //     feeOwner.publicKey,
    //     null,
    //     2,
    //     TOKEN_PROGRAM_ID,
    // );

    let mintA = new Token(
        connection,
        new PublicKey('D9dKAC62v6PFfcibVkWhxoHtgqJ43hqY2xGnstJWHGke'),
        TOKEN_PROGRAM_ID,
        swapPayer
    );

    let mintB = new Token(
        connection,
        new PublicKey('GAVDgd1YrnxDUcqCdzEBhWvXB1gUqg9kcrj7V7ChhYr6'),
        TOKEN_PROGRAM_ID,
        swapPayer
    );

    // let mintB = await Token.createMint(
    //     connection,
    //     swapPayer,
    //     feeOwner.publicKey,
    //     null,
    //     2,
    //     TOKEN_PROGRAM_ID,
    // );

    const tokenAccountA = await mintA.createAccount(swapPayer.publicKey);
    const tokenAccountB = await mintB.createAccount(swapPayer.publicKey);
    await mintA.mintTo(tokenAccountA, swapPayer.publicKey, [], 10000);
    await mintB.mintTo(tokenAccountB, swapPayer.publicKey, [], 20000);

    let baseInfo: TokenProvideInfo = {
        mint: mintA.publicKey,
        amount: 1000,
        account: tokenAccountA
    };
    let quoteInfo: TokenProvideInfo = {
        mint: mintB.publicKey,
        amount: 2000,
        account: tokenAccountB
    };

    let curveType = CurveType.ConstantProduct;
    let tokenSwap:TokenSwap = await createPoolWithKeypair(
        connection,
        swapPayer,
        baseInfo,
        quoteInfo,
        lpMintDecimals,
        fees,
        feeOwner.publicKey,
        curveType,
    );

    console.log('tokenSwap', tokenSwap);

    console.log("fetchedTokenSwap.tokenProgramId: "+tokenSwap.tokenProgramId+" :TOKEN_PROGRAM_ID :"+TOKEN_PROGRAM_ID)
    console.log("fetchedTokenSwap.tokenAccountA: "+tokenSwap.tokenAccountA+" :tokenAccountA :"+tokenAccountA)
    console.log("fetchedTokenSwap.tokenAccountB: "+tokenSwap.tokenAccountB+" :tokenAccountB :"+tokenAccountB)
    console.log("tokenSwap.mintA: "+tokenSwap.mintA+" :mintA.publicKey :"+mintA.publicKey)
    console.log("tokenSwap.mintB: "+tokenSwap.mintB+" :mintB.publicKey :"+mintB.publicKey)
    console.log("tokenSwap.poolToken: "+tokenSwap.poolToken)
    console.log("tokenSwap.feeAccount: "+tokenSwap.feeAccount)
    console.log("TRADING_FEE_NUMERATOR: "+TRADING_FEE_NUMERATOR+" :tokenSwap.tradeFeeNumerator.toNumber() :"+tokenSwap.tradeFeeNumerator.toNumber())
    console.log("TRADING_FEE_DENOMINATOR: "+TRADING_FEE_DENOMINATOR+" :tokenSwap.tradeFeeDenominator.toNumber() :"+tokenSwap.tradeFeeDenominator.toNumber())
    console.log("OWNER_TRADING_FEE_NUMERATOR: "+OWNER_TRADING_FEE_NUMERATOR+" :tokenSwap.ownerTradeFeeNumerator.toNumber() :"+tokenSwap.ownerTradeFeeNumerator.toNumber())
    console.log("OWNER_TRADING_FEE_DENOMINATOR: "+OWNER_TRADING_FEE_DENOMINATOR+" :tokenSwap.ownerTradeFeeDenominator.toNumber() :"+tokenSwap.ownerTradeFeeDenominator.toNumber())
    console.log("OWNER_WITHDRAW_FEE_NUMERATOR: "+OWNER_WITHDRAW_FEE_NUMERATOR+" :tokenSwap.ownerWithdrawFeeNumerator.toNumber() :"+tokenSwap.ownerWithdrawFeeNumerator.toNumber())
    console.log("OWNER_WITHDRAW_FEE_DENOMINATOR: "+OWNER_WITHDRAW_FEE_DENOMINATOR+" :tokenSwap.ownerWithdrawFeeDenominator.toNumber() :"+tokenSwap.ownerWithdrawFeeDenominator.toNumber())
    console.log("HOST_FEE_NUMERATOR: "+HOST_FEE_NUMERATOR+" :tokenSwap.hostFeeNumerator.toNumber() :"+tokenSwap.hostFeeNumerator.toNumber())
    console.log("HOST_FEE_DENOMINATOR: "+HOST_FEE_DENOMINATOR+" :tokenSwap.hostFeeDenominator.toNumber() :"+tokenSwap.hostFeeDenominator.toNumber())
    console.log("curveType: "+curveType+" :tokenSwap.curveType :"+tokenSwap.curveType)

    assert(tokenSwap.tokenProgramId.equals(TOKEN_PROGRAM_ID));
    assert(tokenSwap.mintA.equals(mintA.publicKey));
    assert(tokenSwap.mintB.equals(mintB.publicKey));
    assert(
        TRADING_FEE_NUMERATOR == tokenSwap.tradeFeeNumerator.toNumber(),
    );
    assert(
        TRADING_FEE_DENOMINATOR == tokenSwap.tradeFeeDenominator.toNumber(),
    );
    assert(
        OWNER_TRADING_FEE_NUMERATOR ==
            tokenSwap.ownerTradeFeeNumerator.toNumber(),
    );
    assert(
        OWNER_TRADING_FEE_DENOMINATOR ==
            tokenSwap.ownerTradeFeeDenominator.toNumber(),
    );
    assert(
        OWNER_WITHDRAW_FEE_NUMERATOR ==
            tokenSwap.ownerWithdrawFeeNumerator.toNumber(),
    );
    assert(
        OWNER_WITHDRAW_FEE_DENOMINATOR ==
            tokenSwap.ownerWithdrawFeeDenominator.toNumber(),
    );
    assert(HOST_FEE_NUMERATOR == tokenSwap.hostFeeNumerator.toNumber());
    assert(
        HOST_FEE_DENOMINATOR == tokenSwap.hostFeeDenominator.toNumber(),
    );
    assert(curveType == tokenSwap.curveType);
}

async function testGetPools() {
    console.log('Run test: testGetPools');
    const connection = await getConnection();
    let pools:TokenSwap[] = await getPools(connection);

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

function assert(condition: boolean, message?: string) {
    if (!condition) {
        console.log(Error().stack + ':token-test.js');
        throw message || 'Assertion failed';
    }
}

createTokenSwap()
    .catch(err => {
        console.error(err);
        process.exit(-1);
})
.then(() => process.exit());
