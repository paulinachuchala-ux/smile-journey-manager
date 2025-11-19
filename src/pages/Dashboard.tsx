import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingApprovals: 0,
    approvedPatients: 0,
    budgetSpent: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [patientsRes, budgetRes] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact" }),
      supabase.from("budget_tracking").select("spent_budget").single(),
    ]);

    const patients = patientsRes.data || [];
    const pendingCount = patients.filter(p => p.status === "pending").length;
    const approvedCount = patients.filter(p => p.status === "approved" || p.status === "treatment_started" || p.status === "completed").length;

    setStats({
      totalPatients: patients.length,
      pendingApprovals: pendingCount,
      approvedPatients: approvedCount,
      budgetSpent: budgetRes.data?.spent_budget || 0,
    });
  };

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      description: "All patients in system",
      color: "text-primary",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Clock,
      description: "Awaiting review",
      color: "text-warning",
    },
    {
      title: "Approved Patients",
      value: stats.approvedPatients,
      icon: CheckCircle,
      description: "Successfully approved",
      color: "text-success",
    },
    {
      title: "Budget Spent",
      value: `€${stats.budgetSpent.toLocaleString()}`,
      icon: TrendingUp,
      description: "Current fiscal year",
      color: "text-accent",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of patient management system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              This system helps manage patient approvals for free dental treatments through our initiative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• View all patients and their status in the Patients tab</li>
                <li>• Review pending approvals in the Approvals tab</li>
                <li>• Monitor budget allocation in the Budget tab</li>
                <li>• Manage users and roles in the Users tab (Project Managers only)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
