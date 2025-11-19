import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";

const Approvals = () => {
  const { user, userRole } = useAuth();
  const [pendingPatients, setPendingPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (userRole) {
      fetchPendingPatients();
    }
  }, [userRole]);

  const fetchPendingPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select(`
        *,
        approvals(*)
      `)
      .eq("status", "pending");

    const filtered = data?.filter((patient) => {
      const hasMyApproval = patient.approvals.some(
        (a: any) => a.reviewer_role === userRole && a.status !== "pending"
      );
      return !hasMyApproval;
    });

    setPendingPatients(filtered || []);
  };

  const handleApproval = async (patientId: string, status: "approved" | "declined" | "modification_requested") => {
    if (status === "declined" && !notes) {
      toast.error("Please provide a reason for declining");
      return;
    }

    const { error } = await supabase.from("approvals").insert([{
      patient_id: patientId,
      reviewer_id: user?.id,
      reviewer_role: userRole as any,
      status,
      notes: notes || null,
      reviewed_at: new Date().toISOString(),
    }]);

    if (error) {
      toast.error("Failed to submit approval");
      return;
    }

    if (status === "modification_requested") {
      await supabase
        .from("patients")
        .update({ status: "on_hold" })
        .eq("id", patientId);
    }

    toast.success("Approval submitted successfully");
    setIsDialogOpen(false);
    setNotes("");
    setSelectedPatient(null);
    fetchPendingPatients();
  };

  const canReview = userRole === "scientific_director" || userRole === "values_reviewer";

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending patients</p>
        </div>

        {!canReview && (
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                Only Scientific Directors and Values Reviewers can approve patients.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {canReview && (
          <div className="space-y-4">
            {pendingPatients.map((patient) => (
              <Card key={patient.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription>
                        PDC: {patient.pdc_number} | Clinic: {patient.clinic_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Patient Story</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {patient.patient_story}
                    </p>
                  </div>
                  {patient.primoup_link && (
                    <div>
                      <p className="text-sm font-medium mb-2">Clinical Data</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={patient.primoup_link} target="_blank" rel="noopener noreferrer">
                          View in PrimoUP
                        </a>
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApproval(patient.id, "approved")}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog open={isDialogOpen && selectedPatient?.id === patient.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Request Modification
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Modification</DialogTitle>
                          <DialogDescription>
                            Provide details about what needs to be modified
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter modification details..."
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproval(patient.id, "modification_requested")}
                            className="flex-1"
                          >
                            Submit
                          </Button>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Patient</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for declining this patient
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter decline reason..."
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleApproval(patient.id, "declined")}
                            className="flex-1"
                          >
                            Confirm Decline
                          </Button>
                          <Button variant="outline" onClick={() => setNotes("")}>
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingPatients.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No pending approvals</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Approvals;
