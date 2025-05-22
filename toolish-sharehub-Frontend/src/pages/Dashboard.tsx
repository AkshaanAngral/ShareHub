import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Calendar, DollarSign, Settings, TrendingUp, Users } from "lucide-react";

const Dashboard = ({ userEmail }) => {
  // You can pass userEmail as prop or use your auth context
  const [userStats, setUserStats] = useState({
    toolsListed: 0,
    activeRentals: 0,
    totalEarnings: 0
  });
  const [toolsList, setToolsList] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUserStats(data.stats);
          setToolsList(data.tools || []);
          setRecentActivity(data.recentActivity || []);
        } else {
          throw new Error(data.message || 'Failed to fetch dashboard data');
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        
        // Fallback: fetch just the tools if dashboard API fails
        try {
          const response = await fetch('/api/tools/my', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const toolsData = await response.json();
            const tools = toolsData.tools || [];
            setToolsList(tools);
            setUserStats(prev => ({
              ...prev,
              toolsListed: tools.length
            }));
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    // Handle null, undefined, or invalid numbers
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `₹${validAmount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userEmail?.split('@')[0]}! Here's an overview of your rental activities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button>
              List a New Tool
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">⚠️ {error}</p>
              <p className="text-sm text-red-500 mt-1">Some data might not be up to date.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tools Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? "..." : userStats.toolsListed}
                </div>
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total tools you've listed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? "..." : userStats.activeRentals}
                </div>
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tools currently rented by you
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? "..." : formatCurrency(userStats.totalEarnings)}
                </div>
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Revenue from your tool rentals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Your Listed Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Your Listed Tools
              </CardTitle>
              <CardDescription>
                Tools you've made available for rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading your tools...</p>
              ) : toolsList.length > 0 ? (
                <div className="space-y-4">
                  {toolsList.slice(0, 5).map((tool, index) => (
                    <div key={tool._id || index} className={`flex justify-between items-center ${index < toolsList.length - 1 ? 'border-b pb-3' : ''}`}>
                      <div>
                        <p className="font-medium">{tool.name || tool.toolName}</p>
                        <p className="text-gray-500 text-sm">
                          Listed on {tool.createdAt ? formatDate(tool.createdAt) : 'N/A'}
                        </p>
                      </div>
                      <p className="font-medium text-green-600">
                        {formatCurrency(tool.price || 0)}/day
                      </p>
                    </div>
                  ))}
                  {toolsList.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      ... and {toolsList.length - 5} more tools
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">You haven't listed any tools yet.</p>
                  <Button size="sm">List Your First Tool</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Earnings
              </CardTitle>
              <CardDescription>
                Your latest tool rental income
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading recent activity...</p>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className={`flex justify-between items-start ${index < recentActivity.length - 1 ? 'border-b pb-3' : ''}`}>
                      <div className="flex-1">
                        <p className="font-medium">{activity.toolName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{activity.rentalDays} days</span>
                          <Users className="h-3 w-3 ml-2" />
                          <span>Rented</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(activity.paymentDate)}
                        </p>
                      </div>
                      <p className="font-medium text-green-600">
                        {formatCurrency(activity.amount || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No rental activity yet.</p>
                  <p className="text-sm text-gray-400">
                    Start earning by listing your tools!
                  </p>
                </div>
              )}
            </CardContent>
            {recentActivity.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Earnings
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;