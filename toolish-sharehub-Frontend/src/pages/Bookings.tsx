import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Package,
  RefreshCw,
  Filter,
  Eye
} from "lucide-react";
import { toast } from "sonner";

// Mock components for demo - replace with your actual imports
const BookingCard = ({ booking, onUpdateStatus, onCancel, onViewDetails, getStatusIcon, getStatusColor }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const isPending = booking.status === "pending";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={booking.toolImage || "/api/placeholder/150/150"}
              alt={booking.toolName}
              className="w-full md:w-32 h-32 object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold">{booking.toolName}</h3>
                <p className="text-sm text-muted-foreground">{booking.toolCategory}</p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Rental Period</p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.bookingDate)} - {formatDate(booking.returnDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getDaysDifference(booking.bookingDate, booking.returnDate)} days
                  </p>
                </div>
              </div>

              {booking.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{booking.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Total Cost</p>
                  <p className="text-muted-foreground font-semibold">₹{booking.price}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {booking.renterName ? `Renter: ${booking.renterName}` : `Owner: ${booking.ownerName || 'Owner'}`}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(booking)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>

                {isPending && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => onUpdateStatus(booking._id, "confirmed")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onUpdateStatus(booking._id, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}

                {canCancel && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancel(booking._id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface Booking {
  id:string;
  _id: string;
  tool: string;
  toolName: string;
  toolImage: string;
  toolCategory: string;
  owner: string;
  renter: string;
  renterName: string;
  renterEmail: string;
  bookingDate: string;
  returnDate: string;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  paymentId: string;
  price: number;
  createdAt: string;
  location?: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"renter" | "owner">("renter"); // Toggle between views

  // Fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch both renter and owner bookings
      const [renterResponse, ownerResponse] = await Promise.all([
        fetch('/api/bookings/my', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/bookings/owner', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!renterResponse.ok || !ownerResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const renterData = await renterResponse.json();
      const ownerData = await ownerResponse.json();

      if (renterData.success && ownerData.success) {
        // Mark bookings to distinguish between renter and owner bookings
        const renterBookings = renterData.bookings.map(booking => ({
          ...booking,
          id: booking._id, // For compatibility with existing interface
          userRole: 'renter'
        }));
        
        const ownerBookings = ownerData.bookings.map(booking => ({
          ...booking,
          id: booking._id, // For compatibility with existing interface
          userRole: 'owner'
        }));

        // Store them separately for different views
        const allBookings = viewMode === "renter" ? renterBookings : ownerBookings;
        setBookings(allBookings);
        setFilteredBookings(allBookings);
      } else {
        throw new Error('Failed to load bookings data');
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
      // Don't use mock data in production - just show error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [viewMode]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const filterBookingsByStatus = (status: string) => {
    if (status === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === status));
    }
    setActiveTab(status);
  };

  const handleUpdateBooking = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );
        
        setFilteredBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );

        toast.success(`Booking ${newStatus} successfully`);
      } else {
        throw new Error(data.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.message || "Failed to update booking");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: "cancelled" as any }
              : booking
          )
        );
        
        setFilteredBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: "cancelled" as any }
              : booking
          )
        );

        toast.success("Booking cancelled successfully");
      } else {
        throw new Error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  const getTabCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      completed: bookings.filter(b => b.status === "completed").length,
      cancelled: bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length,
    };
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              {viewMode === "renter" 
                ? "Tools you've rented and their booking status" 
                : "Manage bookings for your listed tools"
              }
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "renter" ? "default" : "outline"}
              onClick={() => setViewMode("renter")}
            >
              My Rentals
            </Button>
            <Button
              variant={viewMode === "owner" ? "default" : "outline"}
              onClick={() => setViewMode("owner")}
            >
              My Tool Bookings
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-600 font-medium">Error loading bookings</p>
                <p className="text-sm text-red-500">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={fetchBookings}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{tabCounts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{tabCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{tabCounts.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total {viewMode === "renter" ? "Spent" : "Earned"}</p>
                <p className="text-2xl font-bold">
                  ₹{bookings.reduce((sum, booking) => sum + (booking.price || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="all" 
            onClick={() => filterBookingsByStatus("all")}
            className="flex items-center gap-2"
          >
            All ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            onClick={() => filterBookingsByStatus("pending")}
            className="flex items-center gap-2"
          >
            Pending ({tabCounts.pending})
          </TabsTrigger>
          <TabsTrigger 
            value="confirmed" 
            onClick={() => filterBookingsByStatus("confirmed")}
            className="flex items-center gap-2"
          >
            Confirmed ({tabCounts.confirmed})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            onClick={() => filterBookingsByStatus("completed")}
            className="flex items-center gap-2"
          >
            Completed ({tabCounts.completed})
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            onClick={() => filterBookingsByStatus("cancelled")}
            className="flex items-center gap-2"
          >
            Cancelled ({tabCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all" 
                    ? `No ${viewMode === "renter" ? "rental" : "booking"} history yet.` 
                    : `No ${activeTab} bookings at the moment.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onUpdateStatus={handleUpdateBooking}
                onCancel={handleCancelBooking}
                onViewDetails={setSelectedBooking}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </div>
      </Tabs>

      {/* Simple booking details modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedBooking.toolImage || "/api/placeholder/100/100"}
                  alt={selectedBooking.toolName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{selectedBooking.toolName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.toolCategory}</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Booking Date</p>
                  <p>{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Return Date</p>
                  <p>{new Date(selectedBooking.returnDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Price</p>
                  <p>₹{selectedBooking.price}</p>
                </div>
                {selectedBooking.location && (
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{selectedBooking.location}</p>
                  </div>
                )}
              </div>
              
              <div className="text-sm">
                <p className="font-medium">
                  {viewMode === "renter" ? "Tool Owner" : "Renter"}
                </p>
                <p>{selectedBooking.renterName || "N/A"}</p>
                <p className="text-muted-foreground">{selectedBooking.renterEmail || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Bookings;