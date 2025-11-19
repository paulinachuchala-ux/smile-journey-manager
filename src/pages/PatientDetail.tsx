import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    const [patientRes, approvalsRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase
        .from("approvals")
        .select(`
          *,
          reviewer:profiles(first_name, last_name, email)
        `)
        .eq("patient_id", id),
    ]);

    setPatient(patientRes.data);
    setApprovals(approvalsRes.data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warning/10 text-warning border-warning/20",
      on_hold: "bg-muted text-muted-foreground",
      approved: "bg-success/10 text-success border-success/20",
      treatment_started: "bg-primary/10 text-primary border-primary/20",
      completed: "bg-success text-success-foreground",
      declined: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "";
  };

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading patient details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">PDC: {patient.pdc_number}</p>
          </div>
          <Badge variant="outline" className={getStatusColor(patient.status)}>
            {patient.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clinic</p>
                <p className="text-sm">{patient.clinic_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-sm">{new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
              {patient.pdc_cost && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">PDC Cost</p>
                  <p className="text-sm">€{patient.pdc_cost.toLocaleString()}</p>
                </div>
              )}
              {patient.discounted_cost && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discounted Cost (70%)</p>
                  <p className="text-sm font-semibold text-success">
                    €{patient.discounted_cost.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.primoup_link && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">PrimoUP Link</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={patient.primoup_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View in PrimoUP
                    </a>
                  </Button>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Liberatoria Status</p>
                <Badge variant={patient.liberatoria_signed ? "default" : "secondary"}>
                  {patient.liberatoria_signed ? "Signed" : "Not Signed"}
                </Badge>
              </div>
              {patient.decline_reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Decline Reason</p>
                  <p className="text-sm text-destructive">{patient.decline_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{patient.patient_story}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
            <CardDescription>Review progress by different roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approvals recorded yet</p>
            ) : (
              approvals.map((approval) => (
                <div key={approval.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{approval.reviewer_role.replace("_", " ")}</p>
                      <Badge variant="outline" className={getStatusColor(approval.status)}>
                        {approval.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reviewed by {approval.reviewer?.first_name} {approval.reviewer?.last_name}
                    </p>
                    {approval.notes && (
                      <p className="text-sm mt-2">{approval.notes}</p>
                    )}
                  </div>
                  {approval.reviewed_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(approval.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientDetail;
