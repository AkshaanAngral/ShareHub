import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Power Tools", "Hand Tools", "Outdoor", "Construction", "Automotive"];

const AddTool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState("url");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File size should be less than 5MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setPreviewUrl(url || "");
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.category || !formData.description.trim() || !formData.price) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return false;
    }
    if (uploadMethod === 'upload' && !selectedFile) {
      toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
      return false;
    }
    if (uploadMethod === 'url' && !formData.imageUrl.trim()) {
      toast({ title: "Error", description: "Please provide an image URL.", variant: "destructive" });
      return false;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Error", description: "Please enter a valid price greater than 0.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Error", description: "Please login first.", variant: "destructive" });
        navigate("/signin");
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);

      if (uploadMethod === 'upload' && selectedFile) {
        formDataToSend.append('image', selectedFile);
      } else if (uploadMethod === 'url' && formData.imageUrl.trim()) {
        formDataToSend.append('imageUrl', formData.imageUrl.trim());
      }

      const response = await fetch("http://localhost:5000/api/tools", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Your tool has been listed successfully!" });
        setFormData({ name: "", category: "", description: "", price: "", imageUrl: "" });
        setSelectedFile(null);
        setPreviewUrl("");
        navigate("/tools");
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to list tool. Status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              <Label htmlFor="name">Tool Name *</Label>
              <Input id="name" placeholder="Enter tool name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" placeholder="Describe your tool" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Daily Rental Price (₹)*</Label>
              <Input id="price" type="number" min="0" step="0.01" placeholder="Enter daily rental price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="space-y-4">
              <Label>Tool Image *</Label>
              <Tabs value={uploadMethod} onValueChange={setUploadMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2"><Link size={16} />Image URL</TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2"><Upload size={16} />Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Input type="url" placeholder="Enter image URL" value={formData.imageUrl} onChange={handleUrlChange} />
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                  <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF, WebP (Max: 5MB)</p>
                </TabsContent>
              </Tabs>
              {previewUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Tool preview"
                      className="max-w-full h-48 object-cover rounded mx-auto"
                      onError={() => {
                        setPreviewUrl("");
                        toast({ title: "Error", description: "Invalid image URL or corrupted file.", variant: "destructive" });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Listing Tool..." : "List Tool"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTool;
