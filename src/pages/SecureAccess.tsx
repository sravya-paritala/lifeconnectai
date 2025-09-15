import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, Lock, Phone } from 'lucide-react';

export default function SecureAccess() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login/signup logic here
    console.log('Form submitted:', formData);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? 'Secure Access Required' : 'Create New Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access your healthcare dashboard' 
              : 'Join LifeConnectAI for personalized healthcare'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="emailPhone" className="flex items-center space-x-2">
                {isLogin ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <div className="flex space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>/</span>
                    <Phone className="w-4 h-4" />
                  </div>
                )}
                <span>{isLogin ? 'Email' : 'Email / Mobile Number'}</span>
              </Label>
              <Input
                id="emailPhone"
                type={isLogin ? 'email' : 'text'}
                placeholder={isLogin ? 'Enter your email' : 'Enter email or mobile number'}
                value={isLogin ? formData.email : (formData.email || formData.phone)}
                onChange={(e) => isLogin 
                  ? handleInputChange('email', e.target.value)
                  : handleInputChange('email', e.target.value)
                }
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Password</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>

            {/* Confirm Password (only for signup) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Re-Enter Password</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-gradient-primary">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <Separator className="my-6" />

          {/* Toggle Mode */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="text-primary hover:text-primary/80"
            >
              {isLogin ? 'Create New Account / Sign Up' : 'Already have an account? Sign In'}
            </Button>
          </div>

          {/* Additional Options for Login */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-sm text-muted-foreground">
                Forgot Password?
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}