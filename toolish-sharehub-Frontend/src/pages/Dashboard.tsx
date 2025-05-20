import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Calendar, DollarSign, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { userEmail } = useAuth();
  const [userStats, setUserStats] = useState({
    toolsListed: 0,
    activeRentals: 0,
    totalEarnings: 0
  });
  const [toolsList, setToolsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/tools/my', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch");
        }
  
        const data = await response.json();
        const tools = data.tools || [];
  
        setToolsList(tools);
  
        setUserStats({
          toolsListed: tools.length,
          activeRentals: 0, // You can update this if you add rental logic
          totalEarnings: 0  // Update if you add earnings logic
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setToolsList([]);
        setUserStats({
          toolsListed: 0,
          activeRentals: 0,
          totalEarnings: 0
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userEmail?.split('@')[0]}! Here's an overview of your rental activities.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/tools/add">
              <Button>
                List a New Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tools Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{loading ? "..." : userStats.toolsListed}</div>
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{loading ? "..." : userStats.activeRentals}</div>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${loading ? "..." : userStats.totalEarnings}</div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Listed Tools</CardTitle>
            <CardDescription>
              Tools you've made available for rent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading your tools...</p>
            ) : toolsList.length > 0 ? (
              <div className="space-y-4">
                {toolsList.slice(0, -1).map((tool, index) => (
                  <div key={tool._id || index} className={`flex justify-between items-center ${index < toolsList.length - 1 ? 'border-b pb-3' : ''}`}>
                    <div>
                      <p className="font-medium">{tool.name || tool.toolName}</p>
                      <p className="text-muted-foreground text-sm">Listed on {
                        tool.createdAt ? new Date(tool.createdAt).toLocaleDateString() : 'N/A'
                      }</p>
                    </div>
                    <p className="font-medium text-green-600">${tool.pricePerDay || tool.dailyRate || tool.price || 0}/day</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">You haven't listed any tools yet.</p>
            )}
          </CardContent>
          <CardFooter>
            {/* Footer content removed as requested */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;