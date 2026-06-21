import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react"
import { ApproveCnicButton } from "@/components/admin/approve-cnic-button"

export default async function AdminCnicVerificationPage() {
  const supabase = await createClient()

  const { data: cnicDocs } = await supabase
    .from("cnic_documents")
    .select("*, profiles:user_id(full_name, email, phone)")
    .order("created_at", { ascending: false })

  const total = cnicDocs?.length || 0
  const pending = cnicDocs?.filter((d: any) => d.status === "pending").length || 0
  const verified = cnicDocs?.filter((d: any) => d.status === "verified").length || 0
  const rejected = cnicDocs?.filter((d: any) => d.status === "rejected").length || 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">CNIC Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and verify customer CNIC documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{verified}</p>
            <p className="text-xs text-muted-foreground mt-1">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{rejected}</p>
            <p className="text-xs text-muted-foreground mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {!cnicDocs || cnicDocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No CNIC documents uploaded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {cnicDocs.map((doc: any) => {
            // State-machine guard: a document is only ready for Approve/Reject
            // once BOTH CNIC images exist. A pending row missing an image is
            // still effectively "Not Uploaded" and must not be actionable.
            const isComplete = Boolean(doc.front_url && doc.back_url)

            return (
              <Card
                key={doc.id}
                className={
                  doc.status === "pending"
                    ? "border-amber-500/30"
                    : doc.status === "verified"
                    ? "border-green-500/30"
                    : "border-red-500/30"
                }
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-serif text-lg font-bold text-card-foreground">
                          {doc.profiles?.full_name || "Unknown Customer"}
                        </h3>
                        <Badge
                          variant={
                            doc.status === "verified"
                              ? "default"
                              : doc.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {doc.status === "verified" ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                          ) : doc.status === "rejected" ? (
                            <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pending Review</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.profiles?.email}</p>
                      {doc.profiles?.phone && (
                        <p className="text-xs text-muted-foreground">{doc.profiles?.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.created_at).toLocaleString("en-PK")}
                      </p>
                      {doc.verified_at && (
                        <p className="text-xs text-green-400">
                          Verified: {new Date(doc.verified_at).toLocaleString("en-PK")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CNIC Images */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        CNIC Front
                      </p>
                      {doc.front_url ? (
                        <a href={doc.front_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={doc.front_url}
                            alt="CNIC Front"
                            className="w-full h-48 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity cursor-pointer"
                          />
                          <p className="text-xs text-blue-400 mt-1">Click to view full size</p>
                        </a>
                      ) : (
                        <div className="w-full h-48 rounded-lg border border-dashed border-border flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">Not uploaded</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        CNIC Back
                      </p>
                      {doc.back_url ? (
                        <a href={doc.back_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={doc.back_url}
                            alt="CNIC Back"
                            className="w-full h-48 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity cursor-pointer"
                          />
                          <p className="text-xs text-blue-400 mt-1">Click to view full size</p>
                        </a>
                      ) : (
                        <div className="w-full h-48 rounded-lg border border-dashed border-border flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">Not uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — only for a fully-uploaded pending document */}
                  {doc.status === "pending" && (
                    isComplete ? (
                      <ApproveCnicButton
                        cnicId={doc.id}
                        userId={doc.user_id}
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Waiting for the customer to upload both CNIC images before this
                          document can be approved or rejected.
                        </p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}