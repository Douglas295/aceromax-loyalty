"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload,  Coins,  Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PointsBalance {
  balance: number;
  earnedPoints: number;
  redeemedPoints: number;
  pointsValue: number;
}

interface PointsHistory {
  id: string;
  type: "earn" | "redeem";
  points: number;
  amount: number;
  status: "pending" | "confirmed" | "redeemed" | "rejected";
  description: string;
  folio?: string;
  receiptUrl?: string;
  createdAt: string;
}


export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    folio: "",
    amount: "",
    file: null as File | null,
    description: ""
  });
  const [redeemForm, setRedeemForm] = useState({
    points: "",
    description: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated") {
      fetchBalance();
      fetchHistory();
    }
  }, [status, router, session]);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/points/balance");
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/points/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.folio || !uploadForm.amount || !uploadForm.file) {
      toast.error("Please fill in all fields and select a file");
      return;
    }

    try {
      setLoading(true);
      
      // Upload file first
      const receiptUrl = await handleFileUpload(uploadForm.file);
      
      // Submit purchase
      const response = await fetch("/api/points/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folio: uploadForm.folio,
          amount: uploadForm.amount,
          receiptUrl: receiptUrl,
          description: uploadForm.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setUploadForm({ folio: "", amount: "", file: null, description: "" });
        setShowUploadForm(false);
        fetchBalance();
        fetchHistory();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      console.error("Submit receipt error:", error);
      toast.error("Error submitting receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!redeemForm.points) {
      toast.error("Please enter points to redeem");
      return;
    }

    const points = parseInt(redeemForm.points);
    if (points <= 0) {
      toast.error("Points must be greater than 0");
      return;
    }

    if (balance && points > balance.balance) {
      toast.error("Insufficient points balance");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/points/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: points,
          description: redeemForm.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setRedeemForm({ points: "", description: "" });
        setShowRedeemForm(false);
        fetchBalance();
        fetchHistory();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      console.error("Redeem points error:", error);
      toast.error("Error redeeming points");
    }finally {
      setLoading(false);
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
          <p className="text-gray-600">Manage your loyalty points and rewards</p>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Points Balance</h2>
                <p className="text-4xl font-bold text-sky-600">{balance.balance}</p>
                <p className="text-gray-600">Value: ${balance.pointsValue.toFixed(2)} MXN</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Earned: {balance.earnedPoints}</p>
                <p className="text-sm text-gray-600">Redeemed: {balance.redeemedPoints}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center justify-center gap-2 h-16 bg-sky-600 hover:bg-sky-700"
          >
            <Upload className="w-5 h-5" />
            Upload Receipt
          </Button>
          <Button
            onClick={() => setShowRedeemForm(true)}
            disabled={!balance || balance.balance <= 0}
            className="flex items-center justify-center gap-2 h-16 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <Gift className="w-5 h-5" />
            Redeem Points
          </Button>
        </div>

        {/* Upload Receipt Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Upload Receipt</h3>
              <form onSubmit={handleSubmitReceipt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folio Number
                  </label>
                  <input
                    type="text"
                    value={uploadForm.folio}
                    onChange={(e) => setUploadForm({ ...uploadForm, folio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter folio number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (MXN)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadForm.amount}
                    onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter purchase amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Brief description of purchase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                    Submit Receipt
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Redeem Points Modal */}
        {showRedeemForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Redeem Points</h3>
              <form onSubmit={handleRedeemPoints} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Redeem
                  </label>
                  <input
                    type="number"
                    value={redeemForm.points}
                    onChange={(e) => setRedeemForm({ ...redeemForm, points: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter points to redeem"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Available: {balance?.balance || 0} points
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={redeemForm.description}
                    onChange={(e) => setRedeemForm({ ...redeemForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="What are you redeeming for?"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Request Redemtion
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowRedeemForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Points History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Points History</h2>
          {history.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No points history yet</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.type === "earn" ? (
                      <Coins className="w-5 h-5 text-green-600" />
                    ) : (
                      <Gift className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.type === "earn" ? "Earned" : "Redeemed"} {item.points} points
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.description || (item.folio ? `Folio: ${item.folio}` : "No description")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${item.type === "earn" ? "text-green-600" : "text-red-600"}`}>
                      {item.type === "earn" ? "+" : "-"}{item.points}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      item.status === "confirmed" ? "bg-green-100 text-green-800" :
                      item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
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
