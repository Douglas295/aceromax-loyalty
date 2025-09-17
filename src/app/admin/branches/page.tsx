"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Branch {
  id: string;
  name: string;
  address: string;
  price: string | number;
  createdAt: string;
}

export default function BranchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isSuperadmin = useMemo(() => session?.user.role === "superadmin", [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && !isSuperadmin) {
      router.push("/admin");
      return;
    }
    if (status === "authenticated") {
      fetchBranches();
    }
  }, [status, isSuperadmin]);

  async function fetchBranches() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/branches");
      if (!res.ok) throw new Error("Failed to fetch branches");
      const data = await res.json();
      setBranches(data);
    } catch (e) {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  async function createBranch(formData: FormData) {
    try {
      setCreating(true);
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          address: formData.get("address"),
          price: formData.get("price"),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create branch");
      }
      toast.success("Branch created");
      (document.getElementById("create-form") as HTMLFormElement)?.reset();
      await fetchBranches();
    } catch (e: any) {
      toast.error(e.message || "Error creating branch");
    } finally {
      setCreating(false);
    }
  }

  async function updateBranch(id: string, data: Partial<Branch>) {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update branch");
      }
      toast.success("Branch updated");
      await fetchBranches();
    } catch (e: any) {
      toast.error(e.message || "Error updating branch");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteBranch(id: string) {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/branches/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete branch");
      }
      toast.success("Branch deleted");
      await fetchBranches();
    } catch (e: any) {
      toast.error(e.message || "Error deleting branch");
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isSuperadmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600">Manage branches and pricing</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Branch</h2>
          <form
            id="create-form"
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              createBranch(fd);
            }}
          >
            <input
              name="name"
              placeholder="Name"
              required
              className="md:col-span-3 border rounded px-3 py-2"
            />
            <input
              name="address"
              placeholder="Address"
              required
              className="md:col-span-6 border rounded px-3 py-2"
            />
            <input
              name="price"
              placeholder="Price per point (e.g., 0.5)"
              type="number"
              step="0.01"
              min="0"
              required
              className="md:col-span-2 border rounded px-3 py-2"
            />
            <div className="md:col-span-1">
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Saving..." : "Add"}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Branches</h2>
          {branches.length === 0 ? (
            <p className="text-gray-600">No branches</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Address</th>
                    <th className="py-2 px-2">Price</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <BranchRow
                      key={b.id}
                      branch={b}
                      updating={updatingId === b.id}
                      deleting={deletingId === b.id}
                      onUpdate={(data) => updateBranch(b.id, data)}
                      onDelete={() => deleteBranch(b.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BranchRow({
  branch,
  updating,
  deleting,
  onUpdate,
  onDelete,
}: {
  branch: Branch;
  updating: boolean;
  deleting: boolean;
  onUpdate: (data: Partial<Branch>) => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(branch.name);
  const [address, setAddress] = useState(branch.address);
  const [price, setPrice] = useState(String(branch.price));

  return (
    <tr className="border-t">
      <td className="py-2 px-2 align-top">
        {edit ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        ) : (
          <span>{branch.name}</span>
        )}
      </td>
      <td className="py-2 px-2 align-top">
        {edit ? (
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        ) : (
          <span>{branch.address}</span>
        )}
      </td>
      <td className="py-2 px-2 align-top">
        {edit ? (
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.01"
            min="0"
            className="border rounded px-2 py-1 w-28"
          />
        ) : (
          <span>{String(branch.price)}</span>
        )}
      </td>
      <td className="py-2 px-2 align-top">
        {edit ? (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onUpdate({ name, address, price });
                setEdit(false);
              }}
              disabled={updating}
            >
              {updating ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEdit(false)} disabled={updating}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEdit(true)}>Edit</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}


