import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Edit, Save, X, Phone, Mail, MapPin, Calendar, Shield, Bell } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodType: string;
  address: string;
  emergencyContact: string;
  allergies: string;
  medications: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relation: string;
  }>;
}

const initialProfile: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+91 9876543210',
  age: '45',
  gender: 'Male',
  bloodType: 'B+',
  address: '123 Health Street, Medical City, State 12345',
  emergencyContact: 'Jane Doe - +91 9876543211',
  allergies: 'Penicillin, Shellfish',
  medications: 'Metformin 500mg, Lisinopril 10mg',
  emergencyContacts: [
    { name: 'John Smith', phone: '+91 9876543210', relation: 'Family' },
    { name: 'Sarah Johnson', phone: '+91 9876543211', relation: 'Friend' },
    { name: 'Dr. Michael Brown', phone: '+91 9876543212', relation: 'Doctor' }
  ]
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [editProfile, setEditProfile] = useState<UserProfile>(initialProfile);

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground">Manage your account and medical information</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 shadow-card">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="bg-accent/10 text-accent-dark">
                    {profile.gender}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary">
                    {profile.age} years
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {profile.bloodType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={editProfile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <p className="text-foreground">{profile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
                    {isEditing ? (
                      <Input
                        value={editProfile.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                      />
                    ) : (
                      <p className="text-foreground">{profile.age} years</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                    {isEditing ? (
                      <select 
                        value={editProfile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full p-2 border border-border rounded-md"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="text-foreground">{profile.gender}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Blood Type</label>
                    {isEditing ? (
                      <select 
                        value={editProfile.bloodType}
                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                        className="w-full p-2 border border-border rounded-md"
                      >
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                    ) : (
                      <p className="text-foreground">{profile.bloodType}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How to reach you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <Input
                        value={editProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-foreground">{profile.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        value={editProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="text-foreground">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </label>
                    {isEditing ? (
                      <Input
                        value={editProfile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p className="text-foreground">{profile.address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Important medical details for healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Emergency Contact</label>
                    {isEditing ? (
                      <Input
                        value={editProfile.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="Name - Phone Number"
                      />
                    ) : (
                      <p className="text-foreground">{profile.emergencyContact}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Known Allergies</label>
                    {isEditing ? (
                      <Input
                        value={editProfile.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        placeholder="List any known allergies"
                      />
                    ) : (
                      <p className="text-foreground">{profile.allergies}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Current Medications</label>
                    {isEditing ? (
                      <Input
                        value={editProfile.medications}
                        onChange={(e) => handleInputChange('medications', e.target.value)}
                        placeholder="List current medications with dosages"
                      />
                    ) : (
                      <p className="text-foreground">{profile.medications}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security & Privacy */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Security & Privacy</span>
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Data Sharing Consent</h4>
                      <p className="text-sm text-muted-foreground">Allow doctors to access your records</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent-dark">
                      Enabled
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Change Password</h4>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}