import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/v3/getAllRegisterUsers");
      if (res.data.status) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching user list", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.number?.toLowerCase().includes(term) ||
      u.address?.city?.toLowerCase().includes(term)
    );
  });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-center py-5">Loading users...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-xl font-bold text-gray-900">Registered Users</h1>

        {/* Search + Export */}
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-60 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportJSON}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg text-sm shadow"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Address</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">City</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">State</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-5 text-gray-500 text-sm"
                >
                  No users found
                </td>
              </tr>
            )}

            {filtered.map((user, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-900 capitalize">
                  {user.name || "-"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{user.email || "-"}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{user.number || "-"}</td>

                <td className="py-3 px-4 text-sm text-gray-700">
                  {user.address?.line1 || user.address?.line2
                    ? `${user.address.line1 || ""} ${user.address.line2 || ""}`
                    : "-"}
                </td>

                <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                  {user.address?.city || "-"}
                </td>

                <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                  {user.address?.state || "-"}
                </td>

                <td className="py-3 px-4 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                    {user.role || "user"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;
