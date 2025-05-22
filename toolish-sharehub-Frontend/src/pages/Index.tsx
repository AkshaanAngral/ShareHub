import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowRight, 
  Wrench, 
  Users, 
  ShieldCheck, 
  Star, 
  Hammer, 
  Axe, 
  Drill, 
  Clipboard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
const ADMIN_URL = import.meta.env.VITE_ADMIN_PANEL_URL;

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
  const [isVisible, setIsVisible] = useState({
    hero: true,
    benefits: true,
    featured: true,
    howItWorks: true,
    cta: true
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with Text Animation */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="relative mb-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                <span className="inline-block animate-slideFromTop">Unlock</span>{" "}
                <span className="inline-block animate-slideFromBottom delay-100">Professional</span>{" "}
                <span className="inline-block animate-slideFromTop delay-200">Equipment</span>
              </h1>
            
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get powerful, industrial-grade tools without the investment. Build bigger, 
              work smarter, and save with our community tool-sharing platform.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
              <Input
                placeholder="Find the perfect tool..."
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
              <Button variant="outline" size="lg" asChild 
                className="transition-all hover:bg-primary/10">
                <Link to="/how-it-works">
                  How It Works
                </Link>
              </Button>
              <Button size="lg" asChild
                className="transition-all hover:scale-105">
                <Link to="/tools">
                  Browse Tools
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated floating tools in background - FIXED FOR CONSISTENCY */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
  {/* Top-left */}
  <div className="animate-float absolute top-20 left-20 opacity-15">
    <Hammer className="h-16 w-16 text-primary/80" />
  </div>

  {/* Top-right */}
  <div className="animate-float-slow absolute top-20 right-20 opacity-15">
    <Drill className="h-16 w-16 text-primary/80" />
  </div>

  {/* Bottom-left */}
  <div className="animate-float-slow absolute top-10 left-80 opacity-15">
    <Clipboard className="h-16 w-16 text-primary/80" />
  </div>

  {/* Bottom-right */}
  <div className="animate-float absolute top-10 right-80 opacity-15">
    <Axe className="h-16 w-16 text-primary/80" />
  </div>


</div>


        
        {/* Benefits cards */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="border border-primary/20 bg-background/80 backdrop-blur-sm 
                  transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-4 transition-transform duration-700 hover:scale-110 hover:bg-primary/20 hover:rotate-12">
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
              <h2 className="text-3xl font-bold relative">
                Featured Tools
                <div className="h-1 w-20 bg-primary mt-2 rounded-full"></div>
              </h2>
              <p className="text-muted-foreground mt-2">Top-rated tools available for rent</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="group">
              <Link to="/tools" className="flex items-center">
                View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <Card
                key={tool.id}
                className="overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1 border border-primary/10"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
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
                  <Button size="sm" className="w-full group" asChild>
                    <Link to={`/tools/${tool.id}`}>
                      <Hammer className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" /> View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - FIXED FOR DARK MODE */}
      <section className="py-20 bg-secondary/30 dark:bg-secondary/10 relative overflow-hidden">
       
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <div className="h-1 w-24 bg-primary/60 mx-auto mt-2 rounded-full"></div>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Three simple steps to get the tools you need
            </p>
          </div>
          
          {/* Redesigned How It Works section with dark mode compatibility */}
          <div className="relative max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-primary/30 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Find Tools",
                  description: "Browse our collection of professional tools by category, location, or project type",
                  icon: Search,
                  bgLight: "bg-blue-100",
                  bgDark: "dark:bg-blue-900/30",
                  iconLight: "text-blue-600",
                  iconDark: "dark:text-blue-400"
                },
                {
                  title: "Book & Pay",
                  description: "Reserve your tools with secure payment and verification",
                  icon: Clipboard,
                  bgLight: "bg-green-100",
                  bgDark: "dark:bg-green-900/30",
                  iconLight: "text-green-600",
                  iconDark: "dark:text-green-400"
                },
                {
                  title: "Get to Work",
                  description: "Pick up your equipment and complete your project with confidence",
                  icon: Axe,
                  bgLight: "bg-amber-100",
                  bgDark: "dark:bg-amber-900/30",
                  iconLight: "text-amber-600",
                  iconDark: "dark:text-amber-400"
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="text-center p-6 relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg border border-primary/10 shadow-sm"
                >
                  {/* Step number */}
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 h-10 w-10 rounded-full bg-primary text-white text-lg font-bold flex items-center justify-center z-10">
                    {index + 1}
                  </div>
                  
                  <div className={`${step.bgLight} ${step.bgDark} rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center mt-6`}>
                    <step.icon className={`h-10 w-10 ${step.iconLight} ${step.iconDark}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/how-it-works">
                Learn More About Our Process <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Build Bigger. Spend Smarter.</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of pros and DIYers who are accessing premium tools without the premium price tag.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild
              className="transition-all duration-300 hover:scale-105">
              <Link to="/tools">
                Find Tools
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild
              className="transition-all duration-300 hover:bg-primary/10">
              <Link to="/tools/add">
                List Your Equipment
              </Link>
            </Button>
            {isLoggedIn && isAdmin && (
              <Button variant="outline" size="lg" asChild>
                <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin Panel
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Styles for animations */}
      <style>{`
        @keyframes slideFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-slideFromTop {
          animation: slideFromTop 0.7s ease forwards;
        }
        
        .animate-slideFromBottom {
          animation: slideFromBottom 0.7s ease forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 7s ease-in-out 1s infinite;
        }
        
        .animate-float-slow {
          animation: float 10s ease-in-out 2s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
};

export default Index;