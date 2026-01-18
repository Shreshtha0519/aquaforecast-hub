import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HelpCircle, Mail, Send, BookOpen, MessageCircle, FileQuestion } from 'lucide-react';

const Help: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const supportEmail = 'support@aquaforecast.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[Support] ${subject}`
    )}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailtoLink;
  };

  const faqItems = [
    {
      question: 'How are predictions calculated?',
      answer: 'Our AI model uses historical demand data, weather patterns, population trends, and seasonal factors to generate forecasts.',
    },
    {
      question: 'Can I upload my own data?',
      answer: 'Yes! Analysts and Admins can upload CSV or Excel files containing water demand data through the Data Upload page.',
    },
    {
      question: 'What do the risk levels mean?',
      answer: 'Safe (🟢) = Supply meets demand. Warning (🟡) = 70-85% efficiency. Critical (🔴) = Below 70% efficiency.',
    },
    {
      question: 'How do I run scenario simulations?',
      answer: 'Navigate to the Simulations page and adjust the sliders for population growth, rainfall, and industrial expansion to see projected impacts.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-primary" />
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">
          Get help with using the Water Demand Forecasting System
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium text-foreground">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Send us a message and we'll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  required
                  className="bg-background border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  required
                  className="bg-background border-border resize-none"
                />
              </div>
              
              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Or email us directly at{' '}
                <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                  {supportEmail}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" className="border-primary/30 text-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline" className="border-primary/30 text-primary">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
