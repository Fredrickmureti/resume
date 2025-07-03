
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeaderSection } from '@/components/HeaderSection';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Zap, Crown, Star } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect to get started",
      features: [
        "Up to 10 resumes & CVs",
        "All resume templates",
        "Basic ATS optimization",
        "PDF downloads",
        "Cover letter generator"
      ],
      icon: <Star className="h-6 w-6" />,
      popular: false,
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const
    },
    {
      name: "Basic",
      price: "$1.50",
      period: "one-time",
      description: "For job seekers who need more",
      features: [
        "Everything in Free",
        "Unlimited resumes & CVs",
        "Advanced ATS scoring",
        "Premium templates",
        "Priority support",
        "Keyword optimization"
      ],
      icon: <Zap className="h-6 w-6" />,
      popular: true,
      buttonText: "Upgrade to Basic",
      buttonVariant: "default" as const
    },
    {
      name: "Pro",
      price: "$5.00",
      period: "3 months",
      description: "Best value for active job seekers",
      features: [
        "Everything in Basic",
        "3 months unlimited access",
        "AI-powered suggestions",
        "Advanced analytics",
        "Custom branding",
        "LinkedIn optimization",
        "Interview preparation tools"
      ],
      icon: <Crown className="h-6 w-6" />,
      popular: false,
      buttonText: "Get Pro Access",
      buttonVariant: "default" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HeaderSection 
        user={user}
        isAdmin={isAdmin}
        atsScore={85}
        isGenerating={false}
        hasMinimalContent={true}
        onDownloadPDF={() => {}}
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. Start free and upgrade when you need more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-2 border-blue-500 scale-105' : 'border border-gray-200'} hover:shadow-lg transition-all duration-300`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <Button 
                  className="w-full mb-6" 
                  variant={plan.buttonVariant}
                  onClick={() => {
                    if (plan.name === "Free") {
                      if (!user) {
                        navigate('/auth');
                      } else {
                        navigate('/');
                      }
                    } else {
                      // TODO: Implement payment flow
                      console.log(`Selected plan: ${plan.name}`);
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and other secure payment methods.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes! Our free plan gives you access to create up to 10 resumes with all basic features.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee on all paid plans if you're not satisfied.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Resume?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers who have successfully landed their dream jobs
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate(user ? '/' : '/auth')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {user ? 'Start Building' : 'Get Started Now'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
