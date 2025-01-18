import React, { useState } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, createCloseAccountInstruction } from '@solana/spl-token';
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { Loader2 } from 'lucide-react';
import ConnectWallet from './ConnectWallet.';

// Fee recipient address - Replace with your actual fee recipient address
const FEE_RECIPIENT = new PublicKey('DnGEmDX82afYUdqRPUwjnyFxa89DoENyrZXowTdtKsbf')
const FEE_PERCENTAGE = 0.10; // 10% fee

const CloseZeroBalanceAccounts: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const { walletProvider } = useAppKitProvider<Provider>('solana');
    const { isConnected } = useAppKitAccount();
    const { connection } = useAppKitConnection();

    const closeZeroBalanceAccounts = async () => {
        if (!walletProvider.publicKey || !walletProvider.signTransaction || !isConnected) {
            setStatus('Wallet not connected or does not support signing');
            return;
        }

        if (!connection) {
            setStatus('Connection not established');
            return;
        }

        setIsProcessing(true);
        try {
            setStatus('Fetching token accounts...');
            const tokenAccounts = await connection.getTokenAccountsByOwner(walletProvider.publicKey, {
                programId: TOKEN_PROGRAM_ID
            });

            const zeroBalanceAccounts = tokenAccounts.value.filter((tokenAccount) => {
                const accountData = AccountLayout.decode(Uint8Array.from(tokenAccount.account.data));
                return accountData.amount.toString() === '0';
            });

            if (zeroBalanceAccounts.length === 0) {
                setStatus('No zero balance accounts found. Nothing to close.');
                setIsProcessing(false);
                return;
            }

            // Get the rent amounts for calculating fees
            const rents = await Promise.all(
                zeroBalanceAccounts.map(account =>
                    connection.getBalance(account.pubkey)
                )
            );

            const totalRent = rents.reduce((sum, rent) => sum + rent, 0);
            const totalFee = Math.floor(totalRent * FEE_PERCENTAGE);

            setStatus(`Found ${zeroBalanceAccounts.length} zero balance accounts. Closing... (Fee: ${totalFee / LAMPORTS_PER_SOL} SOL)`);

            const batchSize = 5;
            for (let i = 0; i < zeroBalanceAccounts.length; i += batchSize) {
                const batch = zeroBalanceAccounts.slice(i, i + batchSize);
                const batchRents = rents.slice(i, i + batchSize);
                const batchFee = Math.floor(batchRents.reduce((sum, rent) => sum + rent, 0) * FEE_PERCENTAGE);
                await closeBatch(batch, batchFee);
                setStatus(`Closed ${Math.min(i + batchSize, zeroBalanceAccounts.length)} out of ${zeroBalanceAccounts.length} accounts`);
            }

            setStatus(`All accounts closed successfully!`);
        } catch (error) {
            console.error('Error closing accounts:', error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeBatch = async (accounts: { pubkey: PublicKey }[], batchFee: number) => {
        if (!connection || !walletProvider.publicKey || !walletProvider.signTransaction) {
            throw new Error('Connection or wallet not ready');
        }

        const transaction = new Transaction();

        // Add close account instructions
        accounts.forEach(account => {
            transaction.add(
                createCloseAccountInstruction(
                    account.pubkey,
                    walletProvider.publicKey!,
                    walletProvider.publicKey!,
                    []
                )
            );
        });

        // Add fee transfer instruction
        if (batchFee > 0) {
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: walletProvider.publicKey,
                    toPubkey: FEE_RECIPIENT,
                    lamports: batchFee
                })
            );
        }

        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = walletProvider.publicKey;

        try {
            const signedTransaction = await walletProvider.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // Update status with signature for user reference
            setStatus(`Transaction submitted. Signature: ${signature}`);

            // Use longer timeout and handle confirmation with more detail
            try {
                await connection.confirmTransaction({
                    signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                }, 'confirmed');

                console.log(`Closed ${accounts.length} accounts and transferred fee. Signature: ${signature}`);
                setStatus(`Successfully closed ${accounts.length} accounts. Signature: ${signature}`);
            } catch (confirmError) {
                // If confirmation times out, provide link to explorer
                const explorerUrl = `https://solscan.io/tx/${signature}`;
                setStatus(`Transaction submitted but confirmation timed out. You can check the status at: ${explorerUrl}`);
                console.log('Confirmation error:', confirmError);
            }
        } catch (error) {
            console.error('Error in closeBatch:', error);
            throw error;
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
            <ConnectWallet />
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Close Zero Balance Accounts
            </h1>

            <div className="mb-4 text-sm text-gray-600 text-center">
                <p>A 10% fee will be charged on recovered SOL</p>
            </div>

            <div className="space-y-6">
                <button
                    onClick={closeZeroBalanceAccounts}
                    disabled={!isConnected || isProcessing}
                    className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Claim Lost SOL'
                    )}
                </button>

                {status && (
                    <div className={`p-4 rounded-lg ${status.includes('Error')
                        ? 'bg-red-50 text-red-800'
                        : status.includes('successfully')
                            ? 'bg-green-50 text-green-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}>
                        <p className="text-sm">{status}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloseZeroBalanceAccounts;