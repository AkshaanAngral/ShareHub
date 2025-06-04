import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye, 
  XCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Booking } from "@/pages/Bookings";

interface BookingCardProps {
  booking: Booking;
  onUpdateStatus: (bookingId: string, status: string) => void;
  onCancel: (bookingId: string) => void;
  onViewDetails: (booking: Booking) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onUpdateStatus,
  onCancel,
  onViewDetails,
  getStatusIcon,
  getStatusColor
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
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
          {/* Tool Image */}
          <div className="flex-shrink-0">
            <img
              src={booking.toolImage}
              alt={booking.toolName}
              className="w-full md:w-32 h-32 object-cover rounded-lg"
            />
          </div>

          {/* Booking Details */}
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
                  <p className="text-muted-foreground font-semibold">${booking.price}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Renter: {booking.renterName}
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
                      onClick={() => onUpdateStatus(booking.id, "confirmed")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onUpdateStatus(booking.id, "rejected")}
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
                    onClick={() => onCancel(booking.id)}
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

export default BookingCard;
