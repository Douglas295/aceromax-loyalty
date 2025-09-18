"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import toast from "react-hot-toast";
import {
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Search,
  Coins,
  Eye,
  Grid3X3,
  Table
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "superadmin";
  createdAt: string;
}

interface PointsTransaction {
  id: string;
  type: "earn" | "redeem";
  points: number;
  status: "pending" | "confirmed" | "redeemed" | "rejected";
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  price: string | number;
  createdAt: string;
  users?: User[];
  pointsTransactions?: PointsTransaction[];
}

interface BranchStats {
  totalBranches: number;
  totalCustomers: number;
  totalAdmins: number;
  averagePrice: number;
  newestBranch: string;
  totalEarnedPoints: number;
  totalRedeemedPoints: number;
}

interface BranchWithStats extends Branch {
  branchCustomers: number;
  earnedPoints: number;
  redeemedPoints: number;
}

export default function BranchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesWithStats, setBranchesWithStats] = useState<BranchWithStats[]>([]);
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const isAdmin = useMemo(() => 
    session?.user.role === "admin" || session?.user.role === "superadmin", 
    [session]
  );

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/branches");
      if (!res.ok) throw new Error("Failed to fetch branches");
      const data = await res.json();
      setBranches(data);
  
      // Calculate stats for each branch
      const branchesWithStatsData: BranchWithStats[] = data.map((branch: Branch) => {
        const branchCustomers = branch.users?.filter((user) => user.role === 'customer').length || 0;
        
        const earnedPoints = branch.pointsTransactions
          ?.filter((transaction) => transaction.type === 'earn' && transaction.status === 'confirmed')
          .reduce((sum, transaction) => sum + transaction.points, 0) || 0;
        
        const redeemedPoints = branch.pointsTransactions
          ?.filter((transaction) => transaction.type === 'redeem' && transaction.status === 'confirmed')
          .reduce((sum, transaction) => sum + transaction.points, 0) || 0;

        return {
          ...branch,
          branchCustomers,
          earnedPoints,
          redeemedPoints
        };
      });

      setBranchesWithStats(branchesWithStatsData);
  
      const totalBranches = data.length;
  
      const totalCustomers = data.reduce((sum: number, branch: Branch) => {
        const customersInBranch = branch.users?.filter((user) => user.role === 'customer').length || 0;
        return sum + customersInBranch;
      }, 0);
  
      const totalAdmins = data.reduce((sum: number, branch: Branch) => {
        const adminsInBranch = branch.users?.filter((user) => user.role === 'admin' || user.role === 'superadmin').length || 0;
        return sum + adminsInBranch;
      }, 0); 
  
      const averagePrice = data.length > 0 
        ? data.reduce((sum: number, branch: Branch) => sum + Number(branch.price), 0) / data.length 
        : 0;
  
      const newestBranch = data.length > 0 
        ? [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].name
        : "N/A";

      const totalEarnedPoints = branchesWithStatsData.reduce((sum, branch) => sum + branch.earnedPoints, 0);
      const totalRedeemedPoints = branchesWithStatsData.reduce((sum, branch) => sum + branch.redeemedPoints, 0);
  
      setStats({
        totalBranches,
        totalCustomers,
        totalAdmins,
        averagePrice,
        newestBranch,
        totalEarnedPoints,
        totalRedeemedPoints
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load branches");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetchBranches();
    }
  }, [status, isAdmin, router, fetchBranches]);

  const filteredBranches = branchesWithStats.filter((branch: BranchWithStats) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Branch Overview</h1>
          <p className="text-gray-600">View branch locations, pricing, and statistics</p>
        </div>

         {/* Stats Cards */}
         {stats && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <Building className="w-8 h-8 text-blue-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Total Branches</p>
                   <p className="text-2xl font-bold text-gray-900">{stats.totalBranches}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <Users className="w-8 h-8 text-green-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Total Customers</p>
                   <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <Coins className="w-8 h-8 text-yellow-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Earned Points</p>
                   <p className="text-2xl font-bold text-gray-900">{stats.totalEarnedPoints.toLocaleString()}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <DollarSign className="w-8 h-8 text-red-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Redeemed Points</p>
                   <p className="text-2xl font-bold text-gray-900">{stats.totalRedeemedPoints.toLocaleString()}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <TrendingUp className="w-8 h-8 text-purple-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Average Price</p>
                   <p className="text-2xl font-bold text-gray-900">
                     ${stats.averagePrice.toFixed(2)} MXN
                   </p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow-md p-6">
               <div className="flex items-center">
                 <Calendar className="w-8 h-8 text-orange-600" />
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Newest Branch</p>
                   <p className="text-lg font-bold text-gray-900">{stats.newestBranch}</p>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Search and Controls */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="flex-1 max-w-md">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input
                   type="text"
                   placeholder="Search branches by name or address..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                 />
               </div>
             </div>
             
             <div className="flex items-center gap-4">
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
               
               {session?.user.role === "superadmin" && (
                 <Button
                   onClick={() => router.push("/admin/branches-crud")}
                   className="bg-sky-600 hover:bg-sky-700 text-white"
                 >
                   <Building className="w-4 h-4 mr-2" />
                   Manage Branches
                 </Button>
               )}
             </div>
           </div>
         </div>

         {/* Branches Content */}
         <div className="bg-white rounded-lg shadow-md overflow-hidden">
           {filteredBranches.length === 0 ? (
             <div className="text-center py-12">
               <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-600 text-lg">
                 {searchTerm ? "No branches found matching your search" : "No branches found"}
               </p>
               <p className="text-gray-500">
                 {searchTerm ? "Try adjusting your search terms" : "Branches will appear here once they are created"}
               </p>
             </div>
           ) : viewMode === "table" ? (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Branch
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Address
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Price per Point
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Customers
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Earned Points
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Redeemed Points
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Created
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Status
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredBranches.map((branch) => (
                     <tr key={branch.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10">
                             <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                               <Building className="h-5 w-5 text-sky-600" />
                             </div>
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 flex items-center">
                           <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                           {branch.address}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 flex items-center">
                           <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                           ${String(branch.price)} MXN
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 flex items-center">
                           <Users className="w-4 h-4 mr-2 text-blue-600" />
                           {branch.branchCustomers}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 flex items-center">
                           <Coins className="w-4 h-4 mr-2 text-yellow-600" />
                           {branch.earnedPoints.toLocaleString()}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 flex items-center">
                           <DollarSign className="w-4 h-4 mr-2 text-red-600" />
                           {branch.redeemedPoints.toLocaleString()}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         <div className="flex items-center">
                           <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                           {new Date(branch.createdAt).toLocaleDateString()}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                           Active
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredBranches.map((branch) => (
                   <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                     <div className="flex items-center mb-4">
                       <div className="flex-shrink-0 h-12 w-12">
                         <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                           <Building className="h-6 w-6 text-sky-600" />
                         </div>
                       </div>
                       <div className="ml-4">
                         <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                         <p className="text-sm text-gray-600">Branch Location</p>
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       <div className="flex items-center text-sm text-gray-600">
                         <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                         <span className="truncate">{branch.address}</span>
                       </div>
                       
                       <div className="flex items-center text-sm text-gray-600">
                         <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                         <span>${String(branch.price)} MXN per point</span>
                       </div>
                       
                       <div className="flex items-center text-sm text-gray-600">
                         <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                         <span>Created {new Date(branch.createdAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       <div className="grid grid-cols-3 gap-4 text-center">
                         <div>
                           <div className="flex items-center justify-center mb-1">
                             <Users className="w-4 h-4 text-blue-600 mr-1" />
                             <span className="text-xs text-gray-600">Customers</span>
                           </div>
                           <p className="text-lg font-semibold text-gray-900">{branch.branchCustomers}</p>
                         </div>
                         <div>
                           <div className="flex items-center justify-center mb-1">
                             <Coins className="w-4 h-4 text-yellow-600 mr-1" />
                             <span className="text-xs text-gray-600">Earned</span>
                           </div>
                           <p className="text-lg font-semibold text-gray-900">{branch.earnedPoints.toLocaleString()}</p>
                         </div>
                         <div>
                           <div className="flex items-center justify-center mb-1">
                             <DollarSign className="w-4 h-4 text-red-600 mr-1" />
                             <span className="text-xs text-gray-600">Redeemed</span>
                           </div>
                           <p className="text-lg font-semibold text-gray-900">{branch.redeemedPoints.toLocaleString()}</p>
                         </div>
                       </div>
                       
                       <div className="mt-3 text-center">
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                           Active
                         </span>
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
  );
}
