import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Booking } from "@/pages/Bookings";

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, status: string) => void;
  onCancel: (bookingId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancel,
  getStatusIcon,
  getStatusColor
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Information */}
          <div className="flex gap-4">
            <img
              src={booking.toolImage}
              alt={booking.toolName}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{booking.toolName}</h3>
              <p className="text-muted-foreground">{booking.toolCategory}</p>
              <Badge className={`mt-2 ${getStatusColor(booking.status)}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rental Period
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">{formatDate(booking.bookingDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Return Date</p>
                  <p className="text-muted-foreground">{formatDate(booking.returnDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">
                    {getDaysDifference(booking.bookingDate, booking.returnDate)} days
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-muted-foreground font-semibold text-lg">${booking.price}</p>
                </div>
                <div>
                  <p className="font-medium">Payment ID</p>
                  <p className="text-muted-foreground font-mono text-xs">{booking.paymentId}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Renter Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Renter Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Name</p>
                <p className="text-muted-foreground">{booking.renterName}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{booking.renterEmail}</p>
              </div>
              {booking.location && (
                <div className="md:col-span-2">
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                  <p className="text-muted-foreground">{booking.location}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Booking Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Booking Timeline
            </h4>
            <div className="text-sm">
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            {isPending && (
              <>
                <Button
                  className="flex-1"
                  onClick={() => {
                    onUpdateStatus(booking.id, "confirmed");
                    onClose();
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onUpdateStatus(booking.id, "rejected");
                    onClose();
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Booking
                </Button>
              </>
            )}

            {booking.status === "confirmed" && (
              <Button
                className="flex-1"
                onClick={() => {
                  onUpdateStatus(booking.id, "completed");
                  onClose();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onCancel(booking.id);
                  onClose();
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetails;