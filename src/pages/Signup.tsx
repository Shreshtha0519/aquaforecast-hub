import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MailIcon,
  Droplets,
  LockIcon,
  UserIcon,
  Shield,
  BarChart3,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  const colors = ['#0EA5E9', '#0369A1', '#0284C7', '#38BDF8'];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path, index) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={colors[index % colors.length]}
            strokeWidth={path.width}
            strokeOpacity={0.3 + (path.id % 10) * 0.04}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.4, 0.8, 0.4],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const success = await signup(email, password, role);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Failed to create account. Email may already be in use.');
    }
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'viewer', icon: Eye, label: 'Viewer', desc: 'View charts & reports' },
    { value: 'analyst', icon: BarChart3, label: 'Analyst', desc: 'Scenario simulation & data management' },
    { value: 'admin', icon: Shield, label: 'Admin', desc: 'Full system control & model training' },
  ];

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1929] via-[#0a1628] to-[#0f172a]" />
      
      {/* Animated paths background */}
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#0369A1]/15 blur-3xl" />
      </div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Droplets className="size-8 text-[#0EA5E9]" />
            <span className="text-2xl font-bold text-white">AquaForecast</span>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">
              Join the water demand forecasting platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="name@example.com"
                  className="ps-10 bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="text-gray-500 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                  <MailIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* First Name & Last Name - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  className="ps-10 bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="text-gray-500 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                  <LockIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger 
                  id="role" 
                  className="w-full bg-[#1e293b]/80 border-white/10 text-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  {roleOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-gray-300 focus:bg-[#0EA5E9]/20 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="size-4 text-[#0EA5E9]" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-[#0EA5E9] data-[state=checked]:border-[#0EA5E9] mt-0.5"
              />
              <div className="grid gap-1 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  Accept terms and conditions
                </label>
                <p className="text-xs text-gray-500">
                  You agree to our{' '}
                  <a href="#" className="text-[#0EA5E9] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#0EA5E9] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 py-2 rounded-md">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0369A1] hover:from-[#0284C7] hover:to-[#0EA5E9] text-white font-semibold shadow-lg shadow-[#0EA5E9]/25 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-[#0EA5E9] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
};

export default Signup;
