import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Calendar, DollarSign, TrendingUp, Users, Package, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = ({ userEmail }) => {
  const [userStats, setUserStats] = useState({
    toolsListed: 0,
    activeRentals: 0,
    totalEarnings: 0,
    pendingRequests: 0
  });
  const [toolsList, setToolsList] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        // Fetch dashboard stats (if available)
        const dashboardPromise = fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch user's tools
        const toolsPromise = fetch('/api/tools/my', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch owner bookings (rental requests)
        const bookingsPromise = fetch('/api/bookings/owner', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const [dashboardRes, toolsRes, bookingsRes] = await Promise.allSettled([
          dashboardPromise,
          toolsPromise,
          bookingsPromise
        ]);

        let toolsData = [];
        let bookingsData = [];

        // Handle tools data
        if (toolsRes.status === 'fulfilled' && toolsRes.value.ok) {
          const toolsResponse = await toolsRes.value.json();
          if (toolsResponse.success) {
            toolsData = toolsResponse.tools || [];
            setToolsList(toolsData);
          }
        }

        // Handle bookings data
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
          const bookingsResponse = await bookingsRes.value.json();
          if (bookingsResponse.success) {
            bookingsData = bookingsResponse.bookings || [];
            
            // Filter pending requests
            const pendingRequests = bookingsData.filter(booking => booking.status === 'pending');
            setRentalRequests(pendingRequests);

            // Recent completed bookings for earnings
            const completedBookings = bookingsData
              .filter(booking => booking.status === 'completed')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);
            setRecentActivity(completedBookings);
          }
        }

        // Calculate stats from real data
        const activeRentals = bookingsData.filter(booking => 
          booking.status === 'confirmed' && 
          new Date(booking.returnDate) >= new Date()
        ).length;
        
        const totalEarnings = bookingsData
          .filter(booking => booking.status === 'completed')
          .reduce((sum, booking) => sum + (booking.price || 0), 0);

        const pendingRequests = bookingsData.filter(booking => booking.status === 'pending').length;

        // Try to use dashboard API stats if available, otherwise use calculated stats
        if (dashboardRes.status === 'fulfilled' && dashboardRes.value.ok) {
          try {
            const dashboardResponse = await dashboardRes.value.json();
            if (dashboardResponse.success) {
              setUserStats(dashboardResponse.stats);
              if (dashboardResponse.recentActivity) {
                setRecentActivity(dashboardResponse.recentActivity);
              }
              if (dashboardResponse.rentalRequests) {
                setRentalRequests(dashboardResponse.rentalRequests);
              }
            } else {
              // Use calculated stats
              setUserStats({
                toolsListed: toolsData.length,
                activeRentals,
                totalEarnings,
                pendingRequests
              });
            }
          } catch (dashboardJsonError) {
            console.warn('Failed to parse dashboard JSON, using calculated stats:', dashboardJsonError);
            // Use calculated stats as fallback
            setUserStats({
              toolsListed: toolsData.length,
              activeRentals,
              totalEarnings,
              pendingRequests
            });
          }
        } else {
          // Use calculated stats
          setUserStats({
            toolsListed: toolsData.length,
            activeRentals,
            totalEarnings,
            pendingRequests
          });
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
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

  const handleRequestAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const status = action === 'accept' ? 'confirmed' : 'rejected';
      
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Remove the request from the list
        setRentalRequests(prev => prev.filter(req => req._id !== bookingId));
        // Update stats
        setUserStats(prev => ({
          ...prev,
          pendingRequests: prev.pendingRequests - 1,
          ...(action === 'accept' && { activeRentals: prev.activeRentals + 1 })
        }));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
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
            <Link to="/bookings">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                View Bookings
              </Button>
            </Link>
            <Link to="/list-tool">
              <Button>
                List a New Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-red-600 font-medium">Error loading dashboard data</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Tools currently being rented
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
                Revenue from completed rentals
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? "..." : userStats.pendingRequests || rentalRequests.length}
                </div>
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting your response
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
                  <Link to="/list-tool">
                    <Button size="sm">List Your First Tool</Button>
                  </Link>
                </div>
              )}
            </CardContent>
            {toolsList.length > 5 && (
              <CardFooter>
                <Link to="/my-tools" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Tools
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>

          {/* Rental Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Rental Requests
              </CardTitle>
              <CardDescription>
                Recent requests to rent your tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading rental requests...</p>
              ) : rentalRequests.length > 0 ? (
                <div className="space-y-4">
                  {rentalRequests.slice(0, 3).map((request, idx) => (
                    <div key={request._id || idx} className={`flex justify-between items-center ${idx < rentalRequests.length - 1 ? 'border-b pb-3' : ''}`}>
                      <div>
                        <p className="font-medium">{request.toolName}</p>
                        <p className="text-gray-500 text-sm">
                          {formatDate(request.bookingDate)} - {formatDate(request.returnDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Requested by {request.renterName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRequestAction(request._id, 'reject')}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleRequestAction(request._id, 'accept')}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No pending requests.</p>
                  <p className="text-sm text-gray-400">
                    Rental requests will appear here.
                  </p>
                </div>
              )}
            </CardContent>
            {rentalRequests.length > 3 && (
              <CardFooter>
                <Link to="/bookings?tab=pending" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Requests
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Earnings
            </CardTitle>
            <CardDescription>
              Your latest completed rental income
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading recent activity...</p>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((booking, index) => (
                  <div key={booking._id || index} className={`flex justify-between items-start ${index < recentActivity.length - 1 ? 'border-b pb-3' : ''}`}>
                    <div className="flex-1">
                      <p className="font-medium">{booking.toolName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(booking.bookingDate)} - {formatDate(booking.returnDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Users className="h-3 w-3" />
                        <span>Rented by {booking.renterName}</span>
                      </div>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(booking.price || 0)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No completed rentals yet.</p>
                <p className="text-sm text-gray-400">
                  Start earning by listing your tools!
                </p>
              </div>
            )}
          </CardContent>
          {recentActivity.length > 0 && (
            <CardFooter>
              <Link to="/bookings?tab=completed" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Earnings
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;