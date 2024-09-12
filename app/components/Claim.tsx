import React, { useState } from 'react';
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, createCloseAccountInstruction } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY ;
const RPC_ENDPOINT = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const CloseZeroBalanceAccounts: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const wallet = useWallet();
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');

    const closeZeroBalanceAccounts = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            setStatus('Wallet not connected or does not support signing');
            return;
        }

        setIsProcessing(true);
        try {
            setStatus('Fetching token accounts...');
            const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
                programId: TOKEN_PROGRAM_ID
            });

            const zeroBalanceAccounts = tokenAccounts.value.filter((tokenAccount) => {
                const accountData = AccountLayout.decode(tokenAccount.account.data);
                return accountData.amount.toString() === '0';
            });

            setStatus(`Found ${zeroBalanceAccounts.length} zero balance accounts. Closing...`);

            const batchSize = 5; // Adjust this number based on performance
            for (let i = 0; i < zeroBalanceAccounts.length; i += batchSize) {
                const batch = zeroBalanceAccounts.slice(i, i + batchSize);
                await closeBatch(batch);
                setStatus(`Closed ${Math.min(i + batchSize, zeroBalanceAccounts.length)} out of ${zeroBalanceAccounts.length} accounts`);
            }

            setStatus('All zero balance accounts closed successfully');
        } catch (error) {
            console.error('Error closing accounts:', error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeBatch = async (accounts: { pubkey: PublicKey }[]) => {
        const transaction = new Transaction();

        accounts.forEach(account => {
            transaction.add(
                createCloseAccountInstruction(
                    account.pubkey,
                    wallet.publicKey!,
                    wallet.publicKey!,
                    []
                )
            );
        });

        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = wallet.publicKey!;

        try {
            const signedTransaction = await wallet.signTransaction!(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, 'confirmed');
            console.log(`Closed ${accounts.length} accounts. Signature: ${signature}`);
        } catch (error) {
            console.error('Error in closeBatch:', error);
            throw error; // Re-throw the error to be caught in the main function
        }
    };

    return (
        <div>
            <h1>Close Zero Balance Token Accounts</h1>
            <button
                onClick={closeZeroBalanceAccounts}
                disabled={!wallet.connected || isProcessing}
                className=''
            >
                {isProcessing ? 'Processing...' : 'Close Zero Balance Accounts'}
            </button>
            <p>{status}</p>
        </div>
    );
};

export default CloseZeroBalanceAccounts;