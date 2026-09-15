import { useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { apiFetch, type AdminFeedback } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 20;

export default function Feedback() {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      const data = await apiFetch<{ total: number; feedback: AdminFeedback[] }>(
        `/api/admin/feedback?${params.toString()}`
      );
      setItems(data.feedback);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(offset);
  }, [load, offset]);

  const remove = async (id: number) => {
    if (!confirm(`Delete feedback #${id}?`)) return;
    try {
      await apiFetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
      setNotice(`Feedback #${id} deleted.`);
      await load(offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Feedback</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {total} platform {total === 1 ? "feedback" : "feedbacks"} from customers and workers.
        </p>
      </div>

      {notice && (
        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">{notice}</p>
      )}
      {error && (
        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Platform feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-bold">ID</th>
                  <th className="py-2 pr-3 font-bold">User</th>
                  <th className="py-2 pr-3 font-bold">Booking</th>
                  <th className="py-2 pr-3 font-bold">Rating</th>
                  <th className="py-2 pr-3 font-bold">Comment</th>
                  <th className="py-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 last:border-0 text-slate-700 align-top">
                    <td className="py-2 pr-3 font-bold text-slate-900">#{f.id}</td>
                    <td className="py-2 pr-3">{f.user_name ?? `#${f.user_id}`}</td>
                    <td className="py-2 pr-3">{f.booking_id ? `#${f.booking_id}` : "-"}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="warning">
                        <Star className="h-3 w-3" />
                        {f.rating}/5
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 max-w-72">
                      <p className="line-clamp-3 leading-relaxed">{f.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{f.created_at ?? ""}</p>
                    </td>
                    <td className="py-2">
                      <Button size="sm" variant="secondary" onClick={() => remove(f.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No feedback yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isLoading && <p className="text-xs font-semibold text-slate-500 py-3">Loading...</p>}
          <div className="flex items-center justify-between pt-3">
            <p className="text-[11px] font-semibold text-slate-500">Page {offset + 1} of {pageCount}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 1))}>
                Previous
              </Button>
              <Button size="sm" variant="secondary" disabled={offset + 1 >= pageCount} onClick={() => setOffset((o) => o + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
