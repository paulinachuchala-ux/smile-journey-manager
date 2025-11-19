import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

const Budget = () => {
  const { userRole } = useAuth();
  const [budget, setBudget] = useState<any>(null);
  const [newAllocated, setNewAllocated] = useState("");

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    const currentYear = new Date().getFullYear();
    const { data } = await supabase
      .from("budget_tracking")
      .select("*")
      .eq("fiscal_year", currentYear)
      .single();
    
    setBudget(data);
  };

  const updateBudget = async () => {
    if (!budget || !newAllocated) return;

    const { error } = await supabase
      .from("budget_tracking")
      .update({ allocated_budget: parseFloat(newAllocated) })
      .eq("id", budget.id);

    if (error) {
      toast.error("Failed to update budget");
      return;
    }

    toast.success("Budget updated successfully");
    fetchBudget();
    setNewAllocated("");
  };

  if (!budget) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading budget...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const percentageUsed = (budget.spent_budget / budget.allocated_budget) * 100;
  const remaining = budget.allocated_budget - budget.spent_budget;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Tracking</h1>
          <p className="text-muted-foreground">Monitor initiative budget allocation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocated Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{budget.allocated_budget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Fiscal Year {budget.fiscal_year}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                €{budget.spent_budget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {percentageUsed.toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                €{remaining.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {(100 - percentageUsed).toFixed(1)}% available
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Visual representation of budget usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget Usage</span>
                <span className="font-medium">{percentageUsed.toFixed(1)}%</span>
              </div>
              <Progress value={percentageUsed} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg Cost per Patient</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {userRole === "project_manager" && (
          <Card>
            <CardHeader>
              <CardTitle>Update Budget</CardTitle>
              <CardDescription>Modify allocated budget for current fiscal year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allocated">New Allocated Budget (€)</Label>
                <Input
                  id="allocated"
                  type="number"
                  placeholder="Enter new budget amount"
                  value={newAllocated}
                  onChange={(e) => setNewAllocated(e.target.value)}
                />
              </div>
              <Button onClick={updateBudget} disabled={!newAllocated}>
                Update Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Budget;
