import { useCallback, useEffect, useState } from "react";
import { apiFetch, type AdminBooking } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingBadgeVariant } from "@/pages/Dashboard";

const PAGE_SIZE = 20;
const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (status: string, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (status) params.set("status", status);
      const data = await apiFetch<{ total: number; bookings: AdminBooking[] }>(
        `/api/admin/bookings?${params.toString()}`
      );
      setBookings(data.bookings);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter, offset);
  }, [load, statusFilter, offset]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Bookings
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {total} {total === 1 ? "booking" : "bookings"} on the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? "default" : "secondary"}
            onClick={() => {
              setStatusFilter(f.value);
              setOffset(0);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
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
                  <th className="py-2 pr-3 font-bold">Service</th>
                  <th className="py-2 pr-3 font-bold">Customer</th>
                  <th className="py-2 pr-3 font-bold">Worker</th>
                  <th className="py-2 pr-3 font-bold">Date</th>
                  <th className="py-2 pr-3 font-bold">Slot</th>
                  <th className="py-2 pr-3 font-bold">Amount</th>
                  <th className="py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 last:border-0 text-slate-700"
                  >
                    <td className="py-2 pr-3 font-bold text-slate-900">#{b.id}</td>
                    <td className="py-2 pr-3 font-medium">{b.service_id}</td>
                    <td className="py-2 pr-3">#{b.customer_id}</td>
                    <td className="py-2 pr-3">#{b.worker_id}</td>
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
                {!isLoading && bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-slate-500">
                      No bookings found.
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
            <p className="text-[11px] font-semibold text-slate-500">
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
