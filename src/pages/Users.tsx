import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { apiFetch, type AdminUser } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const ROLE_FILTERS = [
  { value: "", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "worker", label: "Workers" },
];

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState("");
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (roleFilter: string, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (roleFilter) params.set("role", roleFilter);
      const data = await apiFetch<{ total: number; users: AdminUser[] }>(
        `/api/admin/users?${params.toString()}`
      );
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(role, offset);
  }, [load, role, offset]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {total} registered {total === 1 ? "account" : "accounts"} on the platform.
          </p>
        </div>
        <Link to="/workers/new">
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            Add Worker
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {ROLE_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={role === f.value ? "default" : "secondary"}
            onClick={() => {
              setRole(f.value);
              setOffset(0);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-bold">ID</th>
                  <th className="py-2 pr-3 font-bold">Name</th>
                  <th className="py-2 pr-3 font-bold">Phone</th>
                  <th className="py-2 pr-3 font-bold">Role</th>
                  <th className="py-2 pr-3 font-bold">Status</th>
                  <th className="py-2 font-bold">Referrals</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0 text-slate-700"
                  >
                    <td className="py-2 pr-3 font-bold text-slate-900">#{u.id}</td>
                    <td className="py-2 pr-3 font-medium">
                      {u.full_name ?? "-"}
                    </td>
                    <td className="py-2 pr-3">{u.phone_number}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={u.role === "worker" ? "brand" : "default"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">
                      {u.role === "worker" ? (
                        <Badge variant={u.is_online ? "success" : "default"}>
                          {u.is_online ? "online" : "offline"}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2">{u.referral_points}</td>
                  </tr>
                ))}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isLoading && (
            <p className="text-xs font-semibold text-slate-500 py-3">Loading...</p>
          )}
          <div className="flex items-center justify-between pt-3">
            <p className={cn("text-[11px] font-semibold text-slate-500")}>
              Page {offset + 1} of {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={offset + 1 >= pageCount}
                onClick={() => setOffset((o) => o + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
