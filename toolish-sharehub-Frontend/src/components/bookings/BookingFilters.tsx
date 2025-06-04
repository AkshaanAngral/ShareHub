import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface BookingFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: {
    status?: string;
    dateRange?: { from?: Date; to?: Date };
    toolName?: string;
    priceRange?: { min?: number; max?: number };
  };
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ onFilterChange, filters }) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status: status === "all" ? undefined : status });
  };

  const handleToolNameChange = (toolName: string) => {
    onFilterChange({ ...filters, toolName: toolName || undefined });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFilterChange({ ...filters, dateRange });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (typeof value !== 'object' || Object.keys(value).length > 0)
  );

  // Convert our filter dateRange to the Calendar component's expected format
  const selectedDateRange: DateRange | undefined = filters.dateRange?.from ? {
    from: filters.dateRange.from,
    to: filters.dateRange.to
  } : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select onValueChange={handleStatusChange} value={filters.status || "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tool Name Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tool Name</label>
          <Input
            placeholder="Search by tool name..."
            value={filters.toolName || ""}
            onChange={(e) => handleToolNameChange(e.target.value)}
          />
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Booking Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDateRange?.from ? (
                  selectedDateRange.to ? (
                    <>
                      {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                      {format(selectedDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(selectedDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedDateRange?.from}
                selected={selectedDateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFilters;