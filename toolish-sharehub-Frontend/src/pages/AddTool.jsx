import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Power Tools", "Hand Tools", "Outdoor", "Construction", "Automotive"];

const AddTool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Access the user from AuthContext

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Unauthorized", description: "Please login first.", variant: "destructive" });
      navigate("/signin");
    }
  }, [navigate, toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, category: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          owner: user ? user.id : null, // Add owner ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Success", description: "Your tool has been listed successfully!" });
        navigate("/tools");
      } else {
        toast({ title: "Error", description: data.message || "Failed to list tool.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">List Your Tool for Rent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tool Name</Label>
              <Input id="name" placeholder="Enter tool name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={handleCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Describe your tool" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Daily Rental Price ($)</Label>
              <Input id="price" type="number" min="0" step="0.01" placeholder="Enter daily rental price" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" type="url" placeholder="Enter image URL" value={formData.image} onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full">
              List Tool
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTool;
