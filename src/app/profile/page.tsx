"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [pwdSaving, setPwdSaving] = useState(false);
  const isAuthed = useMemo(() => status === "authenticated" && !!session?.user, [status, session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      const form = e.currentTarget;
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
          phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
          businessType: (form.elements.namedItem("businessType") as HTMLSelectElement)?.value,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save profile");
      }
      toast.success("Profile updated");
      await fetchProfile();
    } catch (e: any) {
      toast.error(e.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setPwdSaving(true);
      const form = e.currentTarget;
      const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement)?.value;
      const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement)?.value;
      const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Fill all password fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update password");
      }
      (form as HTMLFormElement).reset();
      toast.success("Password updated");
    } catch (e: any) {
      toast.error(e.message || "Error updating password");
    } finally {
      setPwdSaving(false);
    }
  }

  if (!isAuthed || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input name="name" defaultValue={profile?.name ?? ""} className="w-full h-11 border rounded px-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input value={profile?.email ?? ""} disabled className="w-full h-11 border rounded px-3 bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input name="phone" defaultValue={profile?.phone ?? ""} className="w-full h-11 border rounded px-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
              <select name="businessType" defaultValue={profile?.businessType ?? "individual"} className="w-full h-11 border rounded px-3">
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
              <input value={profile?.branch?.name ?? ""} disabled className="w-full h-11 border rounded px-3 bg-gray-50 text-gray-600" />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input name="currentPassword" type="password" className="w-full h-11 border rounded px-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input name="newPassword" type="password" className="w-full h-11 border rounded px-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <input name="confirmPassword" type="password" className="w-full h-11 border rounded px-3" />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={pwdSaving}>{pwdSaving ? "Updating..." : "Update Password"}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


