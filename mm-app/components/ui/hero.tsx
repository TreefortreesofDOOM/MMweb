'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth";
import { Clock, CreditCard, HelpCircle, MapPin, Mail, Sparkles, Brain, Palette, Heart, Target, Gem, Quote } from "lucide-react";

export default function Hero() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center space-y-16 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Welcome to Meaning Machine
        </h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          Redefining the Art Gallery Experience—a groundbreaking fusion of art and technology, 
          designed to make art more accessible, engaging, and effortless to own.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/gallery-showcase">
              Explore Gallery
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={user ? "/profile/application" : "/sign-in"}>
              Join Us
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <Clock className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">24/7 Access</h3>
          <p className="text-muted-foreground">
            Explore our physical gallery space independently at your own pace, any time of day or night.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <HelpCircle className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">AI-Powered Assistant</h3>
          <p className="text-muted-foreground">
            Get instant answers about artworks, artists, and gallery information from our virtual assistant.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <CreditCard className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">Effortless Purchases</h3>
          <p className="text-muted-foreground">
            Buy art instantly with mobile payments and automated artist proceeds distribution.
          </p>
        </div>
      </div>

      {/* AI Features for Artists */}
      <div className="w-full bg-accent/50 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">AI-Powered Artist Tools</h2>
            <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
              Leverage cutting-edge AI technology to enhance your artistic journey and connect with the right collectors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Brain className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Portfolio Analysis</h3>
              <p className="text-muted-foreground">
                Get AI-driven insights about your portfolio's themes, styles, and market potential.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Sparkles className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Smart Matching</h3>
              <p className="text-muted-foreground">
                Connect with collectors whose preferences align with your artistic style.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Palette className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Artwork Analysis</h3>
              <p className="text-muted-foreground">
                Get detailed insights into your artwork's composition, symbolism, and emotional impact through AI analysis.
              </p>
            </div>
          </div>

          <Button asChild size="lg" variant="secondary">
            <Link href={user ? "/profile/application" : "/sign-in"}>
              Start Your Artist Journey
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="w-full bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Hear from artists and collectors who are part of our innovative art ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-6 p-6 rounded-lg border bg-card">
              <Quote className="h-8 w-8 text-primary" />
              <p className="text-lg italic">
                "The AI analysis of my portfolio helped me understand my artistic presentation and connect with collectors who appreciate my style."
              </p>
              <div>
                <p className="font-semibold">Sarah Chen</p>
                <p className="text-sm text-muted-foreground">Visual Artist</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6 p-6 rounded-lg border bg-card">
              <Quote className="h-8 w-8 text-primary" />
              <p className="text-lg italic">
                "The Trust Wall concept changed how I think about collecting art. It's made amazing pieces accessible while fairly supporting artists."
              </p>
              <div>
                <p className="font-semibold">Marcus Rodriguez</p>
                <p className="text-sm text-muted-foreground">Art Collector</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6 p-6 rounded-lg border bg-card">
              <Quote className="h-8 w-8 text-primary" />
              <p className="text-lg italic">
                "24/7 access and the AI assistant make exploring art a truly personal experience. It's like having a private gallery tour anytime."
              </p>
              <div>
                <p className="font-semibold">Jordan Taylor</p>
                <p className="text-sm text-muted-foreground">First-Time Collector</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Wall Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold">Innovative Models for Art Ownership</h2>
        <p className="text-lg text-muted-foreground">
          We're rethinking how art is valued and shared through our unique initiatives:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <h3 className="text-xl font-semibold mb-3">An Hour of Your Time</h3>
            <p className="text-muted-foreground">
              Contribute the value of one hour of your wage to enter and explore.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <h3 className="text-xl font-semibold mb-3">The Trust Wall</h3>
            <p className="text-muted-foreground">
              Select from an array of small works on a pay-what-you-want basis.
            </p>
          </div>
        </div>
      </div>

      {/* Collectors Section */}
      <div className="w-full bg-muted/50 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">For Art Collectors</h2>
            <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
              Discover art that resonates with you through our innovative collecting experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Heart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Personalized Discovery</h3>
              <p className="text-muted-foreground">
                Our AI learns your taste and suggests artworks that match your unique preferences.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Target className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Direct Artist Connection</h3>
              <p className="text-muted-foreground">
                Build meaningful relationships with artists whose work speaks to you.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Gem className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Flexible Ownership</h3>
              <p className="text-muted-foreground">
                Choose from various ways to own art, from traditional purchases to our innovative Trust Wall.
              </p>
            </div>
          </div>

          <Button asChild size="lg" variant="secondary">
            <Link href="/gallery-showcase">
              Start Collecting
            </Link>
          </Button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full max-w-2xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl font-bold">Visit Us</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <p className="text-lg">
              The Goat Farm, 1200 Foster Street NW, Studio 125, Atlanta, GA 30318
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:info@meaning-machine.com" className="text-lg text-primary hover:underline">
              info@meaning-machine.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
