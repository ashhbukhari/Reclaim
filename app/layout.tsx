// // /app/layout.tsx
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import AppWalletProvider from "./components/AppWalletProvider";
// // import { CanvasWalletProvider } from "./components/CanvasWalletProvider";
// // import Container from "./components/Container";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "LostSols",
//   description: "DSCVR LostSols canvas helps you claim sol from your empty accounts in your wallet in your wallet ",
//   // openGraph: {
//   //   title: "LostSols",
//   //   description: "Claim lost sols in your account",
//   //   type: "website",
//   //   url: "",
//   //   images: "https://pbs.twimg.com/media/GUhxBcIXIAABTbx?format=jpg&name=large"
//   // },
//   other: {
//     "dscvr:canvas:version": "vNext",

//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AppWalletProvider>
//           {/* <CanvasWalletProvider> */}
//           {/* <Container> */}
//             {children}
//           {/* </Container> */}
//         {/* </CanvasWalletProvider> */}
//       </AppWalletProvider>
//         </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { headers } from "next/headers"; // added

export const metadata: Metadata = {
  title: "LostSols",
  description: " DSCVR LostSols canvas helps you claim sol from your empty accounts in your wallet in your wallet Powered by Reown"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // You can now access cookies using headers()
  const cookies = headers().get('cookie');

  return (
    <html lang="en">
      <body className={inter.className}>
        {children} {/* Ensure that children are rendered */}
      </body>
    </html>
  );
}