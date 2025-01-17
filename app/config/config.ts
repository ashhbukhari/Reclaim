import {
    createAppKit,
    useAppKit,
} from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { solana } from '@reown/appkit/networks'

// Here you have to enter the Project Id for your project which you got in Step 2.
export const projectId = process.env.PROJECT_ID || '433abad036752998dc0c9b572610f8c3'

// Setup solana adapter: 
// You can add more wallet adapters as per the requirement.
const solanaAdapter = new SolanaAdapter({
    wallets: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter()]
})

// Create modal inorder to intialize the Appkit
const modal = createAppKit({
    adapters: [solanaAdapter],
    networks: [solana],
    metadata: {
        name: 'LostSols',
        description: 'DSCVR LostSols canvas helps you claim sol from your empty accounts in your wallet in your wallet',
        url: 'https://reown.com/appkit', // https://dscvr-canvas-rho.vercel.app/
        icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    },
    projectId,
    themeMode: 'light',
    features: {
        analytics: true
    }
})

export {
    modal,
    useAppKit,
}