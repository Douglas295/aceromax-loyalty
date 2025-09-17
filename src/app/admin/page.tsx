"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Users,
  Receipt,
  Clock,
  Coins,
  TrendingUp,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPurchases: number;
  pendingPurchases: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentLiabilities: number;
  totalRedemptions: number;
}

interface PendingTransaction {
  id: string;
  folio: string;
  amount: number;
  receiptUrl?: string;
  status: "pending" | "confirmed" | "redeemed" | "rejected";
  points: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingTransaction, setProcessingTransaction] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "admin" && session.user.role !== "superadmin") {
        router.push("/dashboard");
        return;
      }

      fetchStats();
      fetchPendingTransactions();
    }
  }, [status, router, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      const response = await fetch("/api/admin/points/pending");
      if (response.ok) {
        const data = await response.json();
        setPendingTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (
    transactionId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setProcessingTransaction(transactionId);

      const response = await fetch("/api/admin/points/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          action,
        }),
      });

      if (response.ok) {
        toast.success(`Transaction ${action}d successfully`);
        fetchPendingTransactions();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error ${action}ing transaction`);
    } finally {
      setProcessingTransaction(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage loyalty program and user activities</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Receipt className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingPurchases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Coins className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPointsEarned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPointsRedeemed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Liabilities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.currentLiabilities.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Receipt className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRedemptions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pending Transactions
          </h2>
          {pendingTransactions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No pending transactions to review
            </p>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex-col sm:flex-row flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={`${transaction.receiptUrl??'/placeholder.png'}`}
                            alt="Receipt"
                            width={128}
                            height={128}
                            className="object-cover rounded border"
                            style={{ width: "8rem", height: "8rem" }}
                            unoptimized
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Folio: {transaction.folio}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Amount: ${transaction.amount} MXN
                          </p>
                          <p className="text-sm text-gray-600">
                            Customer: {transaction.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {transaction.user.email}
                          </p>
                          {transaction.user.phone && (
                            <p className="text-sm text-gray-600">
                              Phone: {transaction.user.phone}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Points: {transaction.points}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted:{" "}
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() =>
                          handleTransactionAction(transaction.id, "approve")
                        }
                        disabled={processingTransaction === transaction.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          handleTransactionAction(transaction.id, "reject")
                        }
                        disabled={processingTransaction === transaction.id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
