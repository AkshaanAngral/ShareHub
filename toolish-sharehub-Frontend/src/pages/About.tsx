
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Building, Globe, Heart, CheckCircle, Mail } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About ToolsShare</h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're building a community where tools and equipment are shared, not wasted.
              Our mission is to make professional equipment accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                ToolsShare began when our founders, a group of engineers and contractors, 
                noticed how many professional tools sat unused in workshops and storage 
                facilities across the country.
              </p>
              <p className="text-muted-foreground mb-4">
                They realized that many organizations and individuals need high-quality 
                tools, but can't justify the expense for occasional use. Meanwhile, tool 
                owners were missing out on potential income from their idle equipment.
              </p>
              <p className="text-muted-foreground">
                In 2023, ToolsShare was launched to bridge this gap, creating a marketplace 
                where professional tools could be shared efficiently, safely, and affordably.
              </p>
            </div>
            <div className="bg-muted rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg"
                alt="ToolsShare Team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Community",
                description: "We believe in the power of sharing resources within communities to drive progress and sustainability."
              },
              {
                icon: CheckCircle,
                title: "Quality",
                description: "We ensure all tools on our platform meet professional standards and are well-maintained."
              },
              {
                icon: Heart,
                title: "Sustainability",
                description: "By promoting sharing over buying, we reduce waste and environmental impact of manufacturing."
              }
            ].map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Akshaan Angral",
                role: "CEO & Co-Founder",
                image: "/placeholder.svg"
              },
              
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-background rounded-lg p-6 h-24 flex items-center justify-center">
                <Building className="h-10 w-10 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Have questions or suggestions? We'd love to hear from you. Reach out to our team through any of these channels.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              <span>support@toolsshare.com</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              <span>www.toolsshare.com</span>
            </div>
          </div>
          <Button className="mt-8">
            Send us a message
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
