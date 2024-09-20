import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, createCloseAccountInstruction } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';


const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "e3265bb1-10b4-4d4c-81b2-16f7ee44abfa";
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

            if (zeroBalanceAccounts.length === 0) {
                setStatus('No zero balance accounts found. Nothing to close.');
                setIsProcessing(false);
                return;
            }

            setStatus(`Found ${zeroBalanceAccounts.length} zero balance accounts. Closing...`);

            const batchSize = 5;
            for (let i = 0; i < zeroBalanceAccounts.length; i += batchSize) {
                const batch = zeroBalanceAccounts.slice(i, i + batchSize);
                await closeBatch(batch);
                setStatus(`Closed ${Math.min(i + batchSize, zeroBalanceAccounts.length)} out of ${zeroBalanceAccounts.length} accounts`);
            }

            setStatus('All lost sol claimed successfully');
        } catch (error) {
            console.error('Error claiming sol:', error);
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
            throw error;
        }
    };

    return (
        <div>
            <h1>Close Zero Balance Token Accounts</h1>
            <button
                onClick={closeZeroBalanceAccounts}
                disabled={!wallet.connected || isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isProcessing ? 'Processing...' : 'Claim lost sols'}
            </button>
            <p className="mt-4">{status}</p>
        </div>
    );
};

export default CloseZeroBalanceAccounts;