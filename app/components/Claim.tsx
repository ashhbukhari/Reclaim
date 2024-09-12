import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, createCloseAccountInstruction } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';

// Define your Alchemy API key
const alchemy_key = process.env.ALCHEMY_API_KEY;

const CloseZeroBalanceAccounts: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const wallet = useWallet();
    const connection = new Connection(`https://solana-mainnet.g.alchemy.com/v2/${alchemy_key}`);

    const closeZeroBalanceAccounts = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            setStatus('Wallet not connected or does not support signing');
            return;
        }

        if (!alchemy_key) {
            setStatus('Alchemy API key is not set. Please check your environment variables.');
            return;
        }

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

            for (const account of zeroBalanceAccounts) {
                const transaction = new Transaction().add(
                    createCloseAccountInstruction(
                        account.pubkey,
                        wallet.publicKey,
                        wallet.publicKey,
                        []
                    )
                );

                transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
                transaction.feePayer = wallet.publicKey;

                const signedTransaction = await wallet.signTransaction(transaction);

                const signature = await connection.sendRawTransaction(signedTransaction.serialize());
                await connection.confirmTransaction(signature, 'confirmed');

                console.log(`Closed account ${account.pubkey.toBase58()}. Signature: ${signature}`);
            }

            setStatus('All zero balance accounts closed successfully');
        } catch (error: unknown) {
            console.error('Error closing accounts:', error);
            if (error instanceof Error) {
                setStatus(`Error: ${error.message}`);
            } else {
                setStatus('An unknown error occurred');
            }
        }
    };

    return (
        <div>
            <h1>Close Zero Balance Token Accounts</h1>
            <button onClick={closeZeroBalanceAccounts} disabled={!wallet.connected}>
                Close Zero Balance Accounts
            </button>
            <p>{status}</p>
        </div>
    );
};

export default CloseZeroBalanceAccounts;