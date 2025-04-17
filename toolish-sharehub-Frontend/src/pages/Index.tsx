
import React from "react";
import { Search, ArrowRight, Wrench, Users, ShieldCheck, Star, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

const featuredTools: Tool[] = [
  {
    id: "1",
    name: "Industrial Drill Press",
    description: "Heavy-duty drill press perfect for metalworking",
    price: 75,
    rating: 4.8,
    image: "/Industrial Drill Press.jpeg",
    category: "Power Tools",
  },
  {
    id: "2",
    name: "Professional Chainsaw",
    description: "Powerful chainsaw for forestry work",
    price: 120,
    rating: 4.9,
    image: "/Chainsaw.jpeg",
    category: "Outdoor",
  },
  {
    id: "3",
    name: "Concrete Mixer",
    description: "Large capacity mixer for construction projects",
    price: 95,
    rating: 4.7,
    image: "/Concrete mixer.jpeg",
    category: "Construction",
  },
];

const benefits = [
  {
    title: "Professional Tools",
    description: "Access high-quality commercial-grade tools",
    icon: Wrench,
  },
  {
    title: "Trusted Community",
    description: "Join thousands of verified users sharing tools",
    icon: Users,
  },
  {
    title: "Secure Transactions",
    description: "All rentals are insured and protected",
    icon: ShieldCheck,
  },
];

const Index = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto animate-enter">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Rent Professional Tools
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access high-quality equipment for your projects. Share tools, reduce
              costs, and build together.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
              <Input
                placeholder="Search for tools..."
                className="w-full md:w-96"
              />
              <Button asChild>
                <Link to="/tools">
                  Search
                  <Search className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/how-it-works">
                  How It Works
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link to="/tools">
                  Browse Tools
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Benefits cards */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border border-primary/20 bg-background/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Tools</h2>
              <p className="text-muted-foreground mt-2">Top-rated tools available for rent</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tools" className="flex items-center">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <Card
                key={tool.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-video relative">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary">
                    ${tool.price}/day
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{tool.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{tool.rating}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {tool.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button size="sm" className="w-full" asChild>
                    <Link to={`/tools/${tool.id}`}>
                      <Hammer className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Renting tools with ToolsShare is simple and straightforward
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Find Tools",
                description:
                  "Browse our extensive collection of professional tools and equipment",
                icon: Search,
                delay: 0,
              },
              {
                title: "Book & Pay",
                description:
                  "Secure your rental with our easy booking and payment system",
                icon: Wrench,
                delay: 100,
              },
              {
                title: "Start Working",
                description:
                  "Pick up your tools and get started on your project",
                icon: Star,
                delay: 200,
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center p-6 animate-enter"
                style={{ animationDelay: `${step.delay}ms` }}
              >
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/how-it-works">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Renting?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community today and get access to professional-grade tools without the high cost of ownership.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/tools">
                Browse Tools
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/tools/add">
                List Your Tool
              </Link>
            </Button>
            {isLoggedIn && isAdmin && (
              <Button variant="outline" size="lg" asChild>
                <Link to="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
