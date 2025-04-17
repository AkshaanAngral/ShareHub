
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, AlertCircle, Calendar, DollarSign, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { userEmail } = useAuth();
  
  // Mock data - in a real app this would come from an API
  const userStats = {
    toolsListed: 5,
    activeRentals: 2,
    pendingRequests: 3,
    totalEarnings: 340,
  };

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
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tools Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{userStats.toolsListed}</div>
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
                <div className="text-2xl font-bold">{userStats.activeRentals}</div>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{userStats.pendingRequests}</div>
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${userStats.totalEarnings}</div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Listed Tools</CardTitle>
              <CardDescription>
                Tools you've made available for rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Electric Drill Set</p>
                    <p className="text-muted-foreground text-sm">Listed on Mar 15, 2023</p>
                  </div>
                  <p className="font-medium text-green-600">$15/day</p>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Pressure Washer</p>
                    <p className="text-muted-foreground text-sm">Listed on Apr 2, 2023</p>
                  </div>
                  <p className="font-medium text-green-600">$25/day</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Lawn Mower</p>
                    <p className="text-muted-foreground text-sm">Listed on Apr 15, 2023</p>
                  </div>
                  <p className="font-medium text-green-600">$20/day</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/my-tools" className="w-full">
                <Button variant="outline" className="w-full">View All Tools</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental Requests</CardTitle>
              <CardDescription>
                Recent requests to rent your tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Electric Drill Set</p>
                    <p className="text-muted-foreground text-sm">May 10 - May 12</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Pressure Washer</p>
                    <p className="text-muted-foreground text-sm">May 15 - May 16</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Lawn Mower</p>
                    <p className="text-muted-foreground text-sm">May 20 - May 21</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/rental-requests" className="w-full">
                <Button variant="outline" className="w-full">View All Requests</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;