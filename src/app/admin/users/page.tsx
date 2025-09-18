"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Coins,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Search,
  Users,
  Download,
  Table,
  Grid3X3,
  Calendar,
  Phone,
  Building,
  Mail,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
 
interface UserStats {
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalSpent: number;
  transactionCount: number;
  pendingTransactions: number;
  lastActivity: string;
}

interface RecentTransaction {
  id: string;
  type: "earn" | "redeem";
  points: number;
  amount: number;
  status: "pending" | "confirmed" | "redeemed" | "rejected";
  createdAt: string;
  folio: string;
  description: string;
}

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessType: string;
  branch: {
    name: string;
    address: string;
  };
  createdAt: string;
  stats: UserStats;
  recentTransactions: RecentTransaction[];
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "balance" | "transactions" | "lastActivity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessType: "",
  });

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

      fetchUsers();
    }
  }, [status, router, session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    try {
      setCreating(true);
      const response = await fetch("/api/admin/create-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Customer created successfully");
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          businessType: "",
        });
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Error creating customer");
    } finally {
      setCreating(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "balance":
          aValue = a.stats.currentBalance;
          bValue = b.stats.currentBalance;
          break;
        case "transactions":
          aValue = a.stats.transactionCount;
          bValue = b.stats.transactionCount;
          break;
        case "lastActivity":
          aValue = new Date(a.stats.lastActivity);
          bValue = new Date(b.stats.lastActivity);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // const handleSort = (field: typeof sortBy) => {
  //   if (sortBy === field) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortBy(field);
  //     setSortOrder("desc");
  //   }
  // };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email", 
      "Phone",
      "Business Type",
      "Branch",
      "Current Balance",
      "Total Earned",
      "Total Redeemed",
      "Total Spent",
      "Transaction Count",
      "Pending Transactions",
      "Last Activity",
      "Joined Date"
    ];

    const csvData = users.map(user => [
      user.name,
      user.email,
      user.phone || "",
      user.businessType,
      user.branch.name,
      user.stats.currentBalance,
      user.stats.totalEarned,
      user.stats.totalRedeemed,
      user.stats.totalSpent,
      user.stats.transactionCount,
      user.stats.pendingTransactions,
      new Date(user.stats.lastActivity).toLocaleDateString(),
      new Date(user.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">View and manage user accounts and transaction overview</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div> 
            
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "cards"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Cards
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {session?.user.role === "admin" && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Customer
                  </Button>
                )}
                
                {session?.user.role === "superadmin" && (
                  <Button
                    onClick={() => router.push("/admin/users-crud")}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                )}
              </div>
          </div>

          <div className="flex flex-row gap-4 items-center justify-center sm:justify-start mt-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="name-desc">Name (A-Z)</option>
                <option value="name-asc">Name (Z-A)</option>
                <option value="balance-desc">Balance (High-Low)</option>
                <option value="balance-asc">Balance (Low-High)</option>
                <option value="transactions-desc">Most Transactions</option>
                <option value="transactions-asc">Least Transactions</option>
                <option value="lastActivity-desc">Recent Activity</option>
                <option value="lastActivity-asc">Oldest Activity</option>
              </select>
            <Button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Users Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? "No users found matching your search" : "No users found"}
              </p>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "Users will appear here once they are created"}
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Redeemed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.branch.name}</div>
                        <div className="text-sm text-gray-500">{user.branch.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Coins className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.stats.currentBalance}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-sm text-gray-900">{user.stats.totalEarned}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-red-600 mr-1" />
                          <span className="text-sm text-gray-900">{user.stats.totalRedeemed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.stats.transactionCount}</div>
                        {user.stats.pendingTransactions > 0 && (
                          <div className="text-xs text-yellow-600">
                            {user.stats.pendingTransactions} pending
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.stats.lastActivity).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => setSelectedUser(user)}
                          className="text-sky-600 hover:text-sky-900"
                          variant="ghost"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* User Header */}
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-sky-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.businessType}</p>
                      </div>
                    </div>
                    
                    {/* User Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{user.branch.name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Coins className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-xs text-gray-600">Balance</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.stats.currentBalance}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                            <span className="text-xs text-gray-600">Earned</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.stats.totalEarned}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-xs text-gray-600">Redeemed</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.stats.totalRedeemed}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 text-purple-600 mr-1" />
                            <span className="text-xs text-gray-600">Transactions</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.stats.transactionCount}</p>
                        </div>
                      </div>
                      
                      {/* Activity Info */}
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                          Last Activity: {new Date(user.stats.lastActivity).toLocaleDateString()}
                        </p>
                        {user.stats.pendingTransactions > 0 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            {user.stats.pendingTransactions} pending transactions
                          </p>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="text-center">
                        <Button
                          onClick={() => setSelectedUser(user)}
                          className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Customer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Customer</h3>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  variant="ghost"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    value={createForm.businessType}
                    onChange={(e) => setCreateForm({ ...createForm, businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select business type</option>
                    <option value="Individual">Individual</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createCustomer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={creating || !createForm.name || !createForm.email || !createForm.password || !createForm.businessType}
                  >
                    {creating ? "Creating..." : "Create Customer"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUser.name} - Transaction Details
                </h3>
                <Button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                  variant="ghost"
                >
                  ✕
                </Button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  {selectedUser.phone && <p><strong>Phone:</strong> {selectedUser.phone}</p>}
                  <p><strong>Business Type:</strong> {selectedUser.businessType}</p>
                  <p><strong>Branch:</strong> {selectedUser.branch.name}</p>
                  <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Summary Statistics</h4>
                  <p><strong>Current Balance:</strong> {selectedUser.stats.currentBalance} points</p>
                  <p><strong>Total Earned:</strong> {selectedUser.stats.totalEarned} points</p>
                  <p><strong>Total Redeemed:</strong> {selectedUser.stats.totalRedeemed} points</p>
                  <p><strong>Total Spent:</strong> ${selectedUser.stats.totalSpent.toFixed(2)} MXN</p>
                  <p><strong>Total Transactions:</strong> {selectedUser.stats.transactionCount}</p>
                  <p><strong>Pending:</strong> {selectedUser.stats.pendingTransactions}</p>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
                {selectedUser.recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === "earn" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {transaction.type === "earn" ? "Earned" : "Redeemed"} {transaction.points} points
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.folio} - ${transaction.amount} MXN
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-gray-500">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            transaction.status === "confirmed" ? "bg-green-100 text-green-800" :
                            transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            transaction.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {transaction.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
