"use client";

import { useState, useRef } from "react";
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "uploaded" | "verified" | "rejected";

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  accept: string;
  status: StepStatus;
  fileName?: string;
}

const INITIAL_STEPS: ChecklistStep[] = [
  {
    id: "id_document",
    title: "Government-Issued ID",
    description: "Upload a valid National ID, International Passport, or Driver's Licence.",
    icon: CreditCard,
    points: 35,
    accept: "image/*,application/pdf",
    status: "pending",
  },
  {
    id: "property_deed",
    title: "Property Deed / Title",
    description: "Upload the Certificate of Occupancy (C-of-O) or equivalent title document for your property.",
    icon: Home,
    points: 35,
    accept: "image/*,application/pdf",
    status: "pending",
  },
  {
    id: "utility_bill",
    title: "Proof of Address",
    description: "A utility bill, bank statement, or official letter dated within the last 3 months.",
    icon: FileText,
    points: 20,
    accept: "image/*,application/pdf",
    status: "pending",
  },
  {
    id: "tax_clearance",
    title: "Tax Clearance Certificate",
    description: "Current-year tax clearance from the Federal Inland Revenue Service (FIRS).",
    icon: FileText,
    points: 10,
    accept: "image/*,application/pdf",
    status: "pending",
  },
];

const STATUS_CONFIG: Record<StepStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Not uploaded",  color: "text-slate-400",   icon: Clock },
  uploaded: { label: "Under review",  color: "text-amber-500",   icon: Clock },
  verified: { label: "Verified",      color: "text-emerald-600", icon: CheckCircle2 },
  rejected: { label: "Rejected",      color: "text-red-500",     icon: AlertCircle },
};

export function TrustChecklist() {
  const [steps, setSteps] = useState<ChecklistStep[]>(INITIAL_STEPS);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const score = steps
    .filter((s) => s.status === "verified")
    .reduce((sum, s) => sum + s.points, 0);

  const pendingScore = steps
    .filter((s) => s.status === "uploaded")
    .reduce((sum, s) => sum + s.points, 0);

  const isFullyVerified = score === 100;

  function handleUpload(stepId: string, file: File) {
    setUploading(stepId);

    // Simulate upload + review submission (placeholder)
    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? { ...s, status: "uploaded", fileName: file.name }
            : s
        )
      );
      setUploading(null);
    }, 1500);
  }

  function triggerFileInput(stepId: string) {
    fileRefs.current[stepId]?.click();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Score card */}
      <Card className={cn(
        "border-2 transition-colors",
        isFullyVerified ? "border-emerald-400 bg-emerald-50" : "border-border"
      )}>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={isFullyVerified ? "#10b981" : score > 50 ? "#f59e0b" : "#0ea5e9"}
                strokeWidth="3"
                strokeDasharray={`${score} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{score}</span>
              <span className="text-xs text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold">Trust Score</h3>
              {isFullyVerified && (
                <Badge className="bg-emerald-600 text-white text-xs">Fully Verified</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isFullyVerified
                ? "Your identity is fully verified. Your listings display the TrustRent Verified badge."
                : pendingScore > 0
                ? `${pendingScore} points pending review. Complete remaining steps to unlock verified listings.`
                : "Complete the checklist below to get your listings verified and build tenant trust."}
            </p>
            {!isFullyVerified && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium shrink-0">{score}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist items */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => {
          const StatusIcon = STATUS_CONFIG[step.status].icon;
          const StepIcon = step.icon;
          const isUploading = uploading === step.id;
          const isDone = step.status === "verified";

          return (
            <Card
              key={step.id}
              className={cn(
                "transition-all",
                isDone && "border-emerald-200 bg-emerald-50/40",
                step.status === "rejected" && "border-red-200 bg-red-50/40"
              )}
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  {/* Step icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <StepIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <Badge variant="secondary" className="text-xs">+{step.points} pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                    {step.fileName && (
                      <p className="text-xs text-emerald-700 mt-1 font-medium truncate">
                        📎 {step.fileName}
                      </p>
                    )}
                  </div>

                  {/* Status + action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={cn("flex items-center gap-1 text-xs font-medium", STATUS_CONFIG[step.status].color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {STATUS_CONFIG[step.status].label}
                    </div>

                    {(step.status === "pending" || step.status === "rejected") && (
                      <>
                        <input
                          ref={(el) => { fileRefs.current[step.id] = el; }}
                          type="file"
                          accept={step.accept}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(step.id, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          disabled={isUploading}
                          onClick={() => triggerFileInput(step.id)}
                        >
                          <Upload className="h-3 w-3" />
                          {isUploading ? "Uploading…" : step.status === "rejected" ? "Re-upload" : "Upload"}
                        </Button>
                      </>
                    )}

                    {step.status === "uploaded" && (
                      <span className="text-xs text-amber-600 font-medium">Awaiting review</span>
                    )}

                    {isDone && (
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center">
        Documents are reviewed by the TrustRent team within 1–2 business days.
        All uploads are encrypted and stored securely.
      </p>
    </div>
  );
}
