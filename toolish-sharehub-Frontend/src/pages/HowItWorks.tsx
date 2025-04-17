
import React from "react";
import { Search, Wrench, Star, Calendar, CreditCard, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Find Tools",
      description:
        "Browse our extensive collection of professional tools and equipment. Filter by category, location, and availability to find exactly what you need.",
    },
    {
      icon: Calendar,
      title: "Book & Schedule",
      description:
        "Select your rental dates and review availability. Our real-time calendar ensures that you can see exactly when tools are available.",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description:
        "Pay securely through our platform. We protect your payment until you confirm that you've received the tool in good condition.",
    },
    {
      icon: Truck,
      title: "Pickup or Delivery",
      description:
        "Arrange to pick up the tool from the owner's location, or in some cases, request delivery for larger equipment.",
    },
    {
      icon: Wrench,
      title: "Use the Tool",
      description:
        "Complete your project with professional-grade equipment. Save money by renting instead of buying expensive tools you'll only use occasionally.",
    },
    {
      icon: Star,
      title: "Return & Review",
      description:
        "Return the tool in the condition you received it, and leave a review about your experience to help the community.",
    },
  ];

  const benefits = [
    {
      title: "Save Money",
      description: "Rent tools at a fraction of their purchase price. Perfect for one-time or occasional projects.",
      icon: CreditCard,
    },
    {
      title: "Access Professional Equipment",
      description: "Get access to professional-grade tools that would be too expensive to purchase for a single project.",
      icon: Wrench,
    },
    {
      title: "Community & Support",
      description: "Connect with tool owners who can provide tips and advice for your specific project needs.",
      icon: MessageCircle,
    },
    {
      title: "Eco-Friendly",
      description: "Reduce waste and environmental impact by sharing resources within your community.",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How ToolsShare Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connecting tool owners with people who need them - an easy, secure, 
            and cost-effective way to share professional equipment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/tools">
                Browse Tools
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              List Your Tool
            </Button>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Rental Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                {index !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-16 w-full h-0.5 bg-primary/20"></div>
                )}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Tool Sharing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-background rounded-lg shadow-sm">
                <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How do I know the tools are in good condition?",
                answer: "All tools on our platform are rated and reviewed by previous renters. Additionally, owners must meet our quality standards to list their tools."
              },
              {
                question: "What if a tool breaks during my rental period?",
                answer: "Our protection policies cover accidental damage. Simply report the issue immediately through the app, and our team will help resolve the situation."
              },
              {
                question: "Can I extend my rental period?",
                answer: "Yes, you can request an extension through the app. If the tool is not booked by someone else, the owner can approve your extension request."
              },
              {
                question: "How are payments handled?",
                answer: "We use secure payment processing. Your payment is held until you confirm receipt of the tool, providing protection for both parties."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-background rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community today and start sharing or renting professional tools for your projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/tools">
                Find Tools Now
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              List Your Equipment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
