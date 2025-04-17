import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Wrench, Star, ArrowUpDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCart } from "@/contexts/CartContext";

// Define the Tool type structure
interface Tool {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

const categories = [
  "All Categories",
  "Power Tools",
  "Outdoor",
  "Construction",
  "Hand Tools",
  "Automotive",
];

const Tools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [toolsList, setToolsList] = useState<Tool[]>([]);

  const { addItem } = useCart();

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tools");
        if (response.ok) {
          const data = await response.json();
          setToolsList(data.tools);
        } else {
          console.error("Failed to fetch tools:", response.status);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
      }
    };

    fetchTools();
  }, []);

  const filteredTools = toolsList.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "All Categories" || tool.category === category;
    const matchesPrice =
      tool.price >= priceRange[0] && tool.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Available Tools</h1>
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
              {filteredTools.length > 0 ? filteredTools.length : 0}
            </span>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-5">
            <div className="relative">
              <Input
                placeholder="Search for tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="md:col-span-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Price Range:
              </span>
              <div className="flex-1">
                <Slider
                  value={priceRange}
                  min={0}
                  max={150}
                  step={5}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              <span className="text-sm whitespace-nowrap">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Count and Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Showing {filteredTools.length} tools
          </p>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort by Price
          </Button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool._id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{tool.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm">{tool.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold">
                    ${tool.price} /day
                  </span>
                </div>
                <div className="flex mt-4 gap-2">
                  <Button size="sm" asChild>
                    <Link to={`/tools/${tool._id}`}>
                      <Wrench className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      addItem({
                        id: parseInt(tool._id, 10),
                        name: tool.name,
                        price: tool.price,
                        category: tool.category,
                        condition: "New",
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No tools match your search criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setCategory("All Categories");
                setPriceRange([0, 150]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
