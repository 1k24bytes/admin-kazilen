import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CircleAlert,
  Star,
  UserCheck,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import { apiFetch, type AdminBooking, type AdminStats } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function bookingBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "brand" as const;
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AdminBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<AdminStats>("/api/admin/stats"),
      apiFetch<{ bookings: AdminBooking[] }>("/api/admin/bookings?limit=8"),
    ])
      .then(([s, b]) => {
        setStats(s);
        setRecent(b.bookings);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>;
  }

  if (error || !stats) {
    return (
      <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
        {error ?? "Failed to load dashboard"}
      </p>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.total_users, icon: Users },
    { label: "Customers", value: stats.total_customers, icon: UserCheck },
    { label: "Workers", value: stats.total_workers, icon: Wrench },
    { label: "Workers Online", value: stats.workers_online, icon: Wifi },
    { label: "Total Bookings", value: stats.total_bookings, icon: CalendarCheck },
    { label: "Pending Bookings", value: stats.bookings_pending, icon: CircleAlert },
    { label: "Completed", value: stats.bookings_completed, icon: CalendarCheck },
    { label: "Reviews", value: stats.total_reviews, icon: Star },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Platform overview across users, workers and bookings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500">{c.label}</p>
                <c.icon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Latest booking activity on the platform.</CardDescription>
          </div>
          <Link to="/bookings">
            <Button variant="secondary" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-bold">ID</th>
                  <th className="py-2 pr-3 font-bold">Service</th>
                  <th className="py-2 pr-3 font-bold">Date</th>
                  <th className="py-2 pr-3 font-bold">Slot</th>
                  <th className="py-2 pr-3 font-bold">Amount</th>
                  <th className="py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 last:border-0 text-slate-700"
                  >
                    <td className="py-2 pr-3 font-bold text-slate-900">#{b.id}</td>
                    <td className="py-2 pr-3 font-medium">{b.service_id}</td>
                    <td className="py-2 pr-3">{b.date}</td>
                    <td className="py-2 pr-3">{b.time_slot}</td>
                    <td className="py-2 pr-3">{b.amount ?? "-"}</td>
                    <td className="py-2">
                      <Badge variant={bookingBadgeVariant(b.status)}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
