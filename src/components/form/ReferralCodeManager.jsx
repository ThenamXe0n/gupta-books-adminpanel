"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import toast from "react-hot-toast";

export default function ReferralCodeManager() {
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerType: "student",
    maxUses: 5,
    redeemableamount: "",
  });

  const [referralList, setReferralList] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    ownerType: "all",
    active: "all",
  });

  const fetchReferralCodes = async () => {
    try {
      const res = await axiosInstance.get("/v3/referral/getAll");

      if (res.data.status) setReferralList(res.data.data);
    } catch (err) {
      console.log("Error fetching referrals", err);
    }
  };

  useEffect(() => {
    fetchReferralCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post(
        "/v3/referral/generate-teacher-referral",
        form
      );

      if (res.data.status) {
        toast.success("Referral Code Generated Successfully");

        setForm({
          ownerName: "",
          ownerEmail: "",
          ownerType: "student",
          maxUses: 5,
          redeemableamount: "",
        });

        setShowModal(false);
        fetchReferralCodes();
      }
    } catch (error) {
      console.error("Error creating referral code", error);
    }
  };

  const filteredData = referralList.filter((item) => {
    const search = filters.search.toLowerCase();

    const matchSearch =
      item.code.toLowerCase().includes(search) ||
      item.ownerEmail?.toLowerCase().includes(search) ||
      item.ownerName?.toLowerCase().includes(search);

    const matchOwnerType =
      filters.ownerType === "all" || item.ownerType === filters.ownerType;

    const matchActive =
      filters.active === "all" ||
      (filters.active === "active" ? item.isActive : !item.isActive);

    return matchSearch && matchOwnerType && matchActive;
  });

  // ---- Stats ----
  const total = referralList.length;
  const active = referralList.filter((a) => a.isActive).length;
  const inactive = total - active;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* --------------------------------- HEADER --------------------------------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Referral Code Dashboard
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} /> Create Referral Code
        </button>
      </div>

      {/* --------------------------------- STATS CARDS --------------------------------- */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <p className="text-sm text-slate-500">Total Referral Codes</p>
          <h2 className="text-2xl font-semibold text-slate-800 mt-1">{total}</h2>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <p className="text-sm text-slate-500">Active Codes</p>
          <h2 className="text-2xl font-semibold text-green-600 mt-1">{active}</h2>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <p className="text-sm text-slate-500">Inactive Codes</p>
          <h2 className="text-2xl font-semibold text-red-600 mt-1">{inactive}</h2>
        </div>
      </div>

      {/* --------------------------------- FILTERS + TABLE --------------------------------- */}
      <div className="bg-white shadow-lg border border-slate-200 rounded-xl p-8">

        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Referral Codes List</h3>

          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="border border-slate-300 pl-9 pr-3 py-2 rounded-lg text-sm w-64 focus:ring-1 focus:ring-indigo-300 outline-none"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            {/* Owner Type */}
            <select
              className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-300 outline-none"
              value={filters.ownerType}
              onChange={(e) =>
                setFilters({ ...filters, ownerType: e.target.value })
              }
            >
              <option value="all">All Types</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            {/* Status */}
            <select
              className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-300 outline-none"
              value={filters.active}
              onChange={(e) =>
                setFilters({ ...filters, active: e.target.value })
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={fetchReferralCodes}
              className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-900 text-slate-100 text-xs">
                {[
                  "Code",
                  "Owner",
                  "Email",
                  "Type",
                  "Max",
                  "Used",
                  "Amount",
                  "Status",
                  "Created",
                ].map((h) => (
                  <th key={h} className="p-3 font-medium border-b text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item._id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-mono text-indigo-600">{item.code}</td>
                  <td className="p-3">{item.ownerName || "-"}</td>
                  <td className="p-3">{item.ownerEmail}</td>
                  <td className="p-3 capitalize">{item.ownerType}</td>
                  <td className="p-3">{item.maxUses}</td>
                  <td className="p-3">{item.usedCount}</td>
                  <td className="p-3 font-semibold">₹{item.redeemableamount}</td>
                  <td className="p-3">
                    {item.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className="text-center py-6 text-slate-500 text-sm">
              No matching records found
            </p>
          )}
        </div>
      </div>

      {/* --------------------------------- MODAL --------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-2xl shadow-xl rounded-xl p-6 border border-slate-200 relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
            >
              <X size={22} />
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              Create Referral Code
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">

              <div className="space-y-1">
                <label className="text-sm text-slate-700">Owner Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-700">Owner Email</label>
                <input
                  type="email"
                  required
                  placeholder="owner@example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.ownerEmail}
                  onChange={(e) =>
                    setForm({ ...form, ownerEmail: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-700">Owner Type</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  value={form.ownerType}
                  onChange={(e) =>
                    setForm({ ...form, ownerType: e.target.value })
                  }
                >
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-700">Max Uses</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm text-slate-700">
                  Redeemable Amount
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.redeemableamount}
                  onChange={(e) =>
                    setForm({ ...form, redeemableamount: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition shadow-sm"
                >
                  Generate Referral Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
