import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Account, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { CurveType, TokenSwap } from "../src";
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

const walletAddress = '/home/hitman/.config/solana/id.json';
const feeOwnerKey = new PublicKey('Gph6NUYm5JzvxyqEQz2vKpgNsLfidvkzctRRRBoc1VZX');

const baseMintKey = new PublicKey('D9dKAC62v6PFfcibVkWhxoHtgqJ43hqY2xGnstJWHGke');
const baseAmount = '1000';

const quoteMintKey = new PublicKey('GAVDgd1YrnxDUcqCdzEBhWvXB1gUqg9kcrj7V7ChhYr6');
const quoteAmount = '100';

const lpMintDecimals = 9;

export async function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey) {
    const [ publicKey ] = await PublicKey.findProgramAddress(
        [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )
    return publicKey
}
async function getMintDecimals(connection: Connection, mintKey: PublicKey): Promise<number> {
    try{
        const mintInfo = await connection.getParsedAccountInfo(mintKey);
        return (mintInfo.value?.data as any).parsed.info.decimals
    }catch{
        throw new Error('Can\'t get the mint information');
    }
}
async function createTokenSwap() {
    
    console.log('Creating pools using solana config');
    
    const connection = await getConnection();

    const payer = new Account(
        Buffer.from(
          JSON.parse(
            require("fs").readFileSync(walletAddress, {
              encoding: "utf-8",
            })
          )
        )
      );
    console.log(`Wallet key is ${payer.publicKey}`)
    console.log(`The price is ${+baseAmount / +quoteAmount}`)

    const baseMintDecimals = await getMintDecimals(connection, baseMintKey);
    const quoteMintDecimals = await getMintDecimals(connection, quoteMintKey);

    const tokenAccountA = await findAssociatedTokenAddress(payer.publicKey, baseMintKey);
    const tokenAccountB = await findAssociatedTokenAddress(payer.publicKey, quoteMintKey);

    let baseInfo: TokenProvideInfo = {
        mint: baseMintKey,
        amount: +baseAmount * 10 ** baseMintDecimals,
        account: tokenAccountA
    };
    let quoteInfo: TokenProvideInfo = {
        mint: quoteMintKey,
        amount: +quoteAmount * 10 ** quoteMintDecimals,
        account: tokenAccountB
    };

    let curveType = CurveType.ConstantProduct;
    let tokenSwap:TokenSwap = await createPoolWithKeypair(
        connection,
        payer,
        baseInfo,
        quoteInfo,
        lpMintDecimals,
        {
            tradeFeeDenominator: TRADING_FEE_DENOMINATOR,
            tradeFeeNumerator: TRADING_FEE_NUMERATOR,
            ownerTradeFeeNumerator: OWNER_TRADING_FEE_NUMERATOR,
            ownerTradeFeeDenominator: OWNER_TRADING_FEE_DENOMINATOR,
            ownerWithdrawFeeNumerator: OWNER_WITHDRAW_FEE_NUMERATOR,
            ownerWithdrawFeeDenominator: OWNER_WITHDRAW_FEE_DENOMINATOR,
            hostFeeNumerator: HOST_FEE_NUMERATOR,
            hostFeeDenominator: HOST_FEE_DENOMINATOR
        },
        new PublicKey(feeOwnerKey),
        curveType,
    );

    console.log('tokenSwap', tokenSwap);

    console.log("fetchedTokenSwap.tokenProgramId: "+tokenSwap.tokenProgramId+" :TOKEN_PROGRAM_ID :"+TOKEN_PROGRAM_ID)
    console.log("fetchedTokenSwap.tokenAccountA: "+tokenSwap.tokenAccountA+" :tokenAccountA :"+tokenAccountA)
    console.log("fetchedTokenSwap.tokenAccountB: "+tokenSwap.tokenAccountB+" :tokenAccountB :"+tokenAccountB)
    console.log("tokenSwap.mintA: "+tokenSwap.mintA+" :mintA.publicKey :"+baseMintKey)
    console.log("tokenSwap.mintB: "+tokenSwap.mintB+" :mintB.publicKey :"+quoteMintKey)
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
    assert(tokenSwap.mintA.equals(baseMintKey));
    assert(tokenSwap.mintB.equals(quoteMintKey));
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
