"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Upload, 
  Coins, 
  Gift, 
  Search, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building,
  MapPin,
  Grid3X3,
  List
} from "lucide-react";
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
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  price: number;
  createdAt: string;
}


export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "redeemed" | "rejected">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "earn" | "redeem">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "points" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewType, setViewType] = useState<"table" | "card">("table");
  const [uploadForm, setUploadForm] = useState({
    folio: "",
    amount: "",
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
      fetchBranch();
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

  const fetchBranch = async () => {
    try {
      const response = await fetch("/api/user/branch");
      if (response.ok) {
        const data = await response.json();
        setBranch(data);
      }
    } catch (error) {
      console.error("Error fetching branch:", error);
    }
  };
 
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.folio || !uploadForm.amount) {
      toast.error("Please fill in all fields and select a file");
      return;
    }

    try {
      setLoading(true);
      
      // Submit purchase
      const response = await fetch("/api/points/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folio: uploadForm.folio,
          amount: uploadForm.amount,
          description: uploadForm.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setUploadForm({ folio: "", amount: "", description: "" });
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

  // Filter and sort transactions
  const filteredAndSortedHistory = history
    .filter((item) => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.folio && item.folio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.amount.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "points":
          aValue = a.points;
          bValue = b.points;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "redeemed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "redeemed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        {/* Professional Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session.user.name}</p>
        </div>

  
        {/* Professional Balance Overview */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Balance */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-md">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Balance</h3>
                    <p className="text-xs text-gray-400">Available points</p>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-green-600">{balance.balance.toLocaleString()}</p>
                <p className="text-sm text-green-600">≈ ${balance.pointsValue.toFixed(2)} MXN</p>
              </div>
            </div>

            {/* Total Earned */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-md">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Earned</h3>
                    <p className="text-xs text-gray-400">Lifetime points</p>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-blue-600">{balance.earnedPoints.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Points earned</p>
              </div>
            </div>

            {/* Total Redeemed */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-md">
                    <Gift className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Redeemed</h3>
                    <p className="text-xs text-gray-400">Points used</p>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-orange-500">{balance.redeemedPoints.toLocaleString()}</p>
                <p className="text-sm text-orange-500">Points redeemed</p>
              </div>
            </div>
          </div>
        )} 

        {/* Branch Information */}
        {branch && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-center space-x-4 gap-6 items-center">
              {/* Branch Name */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Branch Name</h4>
                  <p className="text-lg font-semibold text-gray-900">{branch.name}</p>
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h4>
                  <p className="text-sm text-gray-900">{branch.address}</p>
                </div>
              </div>
              
              {/* Point Value */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Point Value</h4>
                  <p className="text-lg font-semibold text-gray-900">${branch.price} MXN</p>
                  <p className="text-xs text-gray-500">per point</p>
                </div>
              </div>
            </div>
            {/* Professional Action Buttons */}
            <div className="flex justify-center items-center p-6 flex-col">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="flex items-center justify-center gap-3 h-12 bg-[#6C5CE7] hover:bg-[#5A4DC0] text-white font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Submit Receipt
                </Button>
                <Button
                  onClick={() => setShowRedeemForm(true)}
                  disabled={!balance || balance.balance <= 0}
                  className="flex items-center justify-center gap-3 h-12 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-gray font-medium"
                >
                  <Gift className="w-5 h-5" />
                  Redeem Points
                </Button>
              </div>
              {balance && balance.balance > 0 && (
                <p className="text-sm text-gray-600 mt-3">
                  You have {balance.balance.toLocaleString()} points available for redemption
                </p>
              )}
            </div>
          </div>
        )}

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
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Brief description of purchase"
                    rows={3}
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

        {/* Professional Transaction History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                <p className="text-sm text-gray-500">View your points transactions</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-white border border-gray-300 rounded-md p-1">
                  <button
                    onClick={() => setViewType("table")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewType === "table"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewType("card")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewType === "card"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Cards
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="redeemed">Redeemed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="earn">Earned</option>
                <option value="redeem">Redeemed</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High-Low)</option>
                <option value="amount-asc">Amount (Low-High)</option>
                <option value="points-desc">Points (High-Low)</option>
                <option value="points-asc">Points (Low-High)</option>
              </select>
            </div>
          </div>

          {/* Transaction Content */}
          <div className="overflow-x-auto">
            {filteredAndSortedHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                    ? "No transactions found matching your criteria" 
                    : "No transaction history yet"
                  }
                </p>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by submitting a receipt to earn points"
                  }
                </p>
              </div>
            ) : viewType === "table" ? (
              // Table View
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            item.type === "earn" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {item.type === "earn" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <Gift className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.type === "earn" ? "Earned" : "Redeemed"} Points
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description || (item.folio ? `Folio: ${item.folio}` : "No description")}
                            </div>
                            {item.folio && (
                              <div className="text-xs text-gray-400">
                                Folio: {item.folio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.amount.toFixed(2)} MXN</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          item.type === "earn" ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.type === "earn" ? "+" : "-"}{item.points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Card View
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedHistory.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          item.type === "earn" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {item.type === "earn" ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <Gift className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>

                      {/* Transaction Type */}
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {item.type === "earn" ? "Earned Points" : "Redeemed Points"}
                        </h3>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description || (item.folio ? `Folio: ${item.folio}` : "No description")}
                        </p>
                        {item.folio && (
                          <p className="text-xs text-gray-400 mt-1">
                            Folio: {item.folio}
                          </p>
                        )}
                      </div>

                      {/* Amount and Points */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">${item.amount.toFixed(2)} MXN</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Points</p>
                          <p className={`text-lg font-semibold ${
                            item.type === "earn" ? "text-green-600" : "text-red-600"
                          }`}>
                            {item.type === "earn" ? "+" : "-"}{item.points.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
