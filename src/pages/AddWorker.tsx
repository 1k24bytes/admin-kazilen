import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatedWorker {
  id: number;
  phone_number: string;
  full_name: string | null;
  referral_code: string | null;
}

const GENDERS = ["Male", "Female", "Other"];

export default function AddWorker() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedWorker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setPhone("");
    setFullName("");
    setDob("");
    setGender("Male");
    setError(null);
    setCreated(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setIsSubmitting(true);
    try {
      const data = await apiFetch<CreatedWorker>("/api/admin/workers", {
        method: "POST",
        body: JSON.stringify({
          phone_number: phone.trim(),
          full_name: fullName.trim(),
          dob: dob || null,
          gender: gender || null,
        }),
      });
      setCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create worker");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Add Worker
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Create a worker account directly. Phone verification is skipped for
          admin-created accounts.
        </p>
      </div>

      {created ? (
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <CardTitle className="mt-1">Worker created</CardTitle>
            <CardDescription>
              {created.full_name} (ID #{created.id}) can now sign in to the
              worker portal with +{created.phone_number} using OTP.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={resetForm}>Add another worker</Button>
            <Link to="/users">
              <Button variant="secondary" className="w-full sm:w-auto">
                View all users
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Worker details</CardTitle>
            <CardDescription>
              Matches the worker registration fields (phone, name, dob, gender).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 items-center px-3 bg-slate-100 border border-slate-300 text-xs font-bold text-slate-500 rounded-sm shrink-0">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full bg-white border border-slate-300 text-sm font-medium text-slate-900 rounded-sm px-3 py-1.5 focus:outline-none focus:border-brand"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create worker"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
