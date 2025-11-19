import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pdc_number: string;
  status: string;
  clinic_name: string;
  created_at: string;
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    
    setPatients(data || []);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pdc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Manage all patient records</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, PDC number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <Badge variant="outline" className={getStatusColor(patient.status)}>
                        {patient.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">PDC:</span> {patient.pdc_number}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {patient.email}
                      </div>
                      <div>
                        <span className="font-medium">Clinic:</span> {patient.clinic_name}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No patients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Patients;
