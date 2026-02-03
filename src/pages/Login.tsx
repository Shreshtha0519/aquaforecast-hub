import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
      <div className="absolute inset-0 ocean-gradient opacity-90" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-ocean-surface/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <Card className="w-full max-w-md relative z-10 glass-card border-primary/20 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm animate-pulse-glow">
              <Droplets className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Water Demand Forecasting
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access the forecasting system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
            
            {error && (
              <p className="text-sm text-danger text-center bg-destructive/10 p-2 rounded">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
