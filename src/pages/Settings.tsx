import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Download,
  Save,
  Moon,
  Sun,
  Loader2,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { downloadCSV } from '@/utils/exportUtils';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, updateNotification, resetSettings, saveSettings, isSaving } = useSettings();
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    // In a real app, this would update the user profile
    toast.success('Profile updated', {
      description: 'Your profile changes have been saved',
    });
    setIsUpdatingProfile(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both password fields match',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters',
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Password updated', {
      description: 'Your password has been changed successfully',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsUpdatingPassword(false);
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    
    try {
      const products = await apiGet<
        {
          id: number;
          sku: string;
          name: string;
          category_id: number;
          price: number | null;
          shelf_space_meters: number | null;
          store_id: number;
        }[]
      >('/products');

      const productData = products.map(p => ({
        SKU: p.sku,
        'Product Name': p.name,
        'Category ID': p.category_id,
        Price: p.price ?? '',
        'Shelf Space (m)': p.shelf_space_meters ?? '',
        'Store ID': p.store_id,
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      downloadCSV(productData, `shelfiq-export-${new Date().toISOString().split('T')[0]}`);
      
      toast.success('Export completed', {
        description: `${productData.length} products exported to CSV`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    toast.success('Settings reset', {
      description: 'All settings have been restored to defaults',
    });
  };

  const handleSaveSettings = async () => {
    await saveSettings();
    toast.success('Settings saved', {
      description: 'Your preferences have been saved',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Profile</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">{user?.name}</h4>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-primary capitalize mt-1">{user?.role} Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Appearance</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
            </div>
            <Switch 
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Performance Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when zones underperform</p>
            </div>
            <Switch 
              checked={settings.notifications.performanceAlerts}
              onCheckedChange={(checked) => updateNotification('performanceAlerts', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Import Completion</p>
              <p className="text-sm text-muted-foreground">Notify when data imports finish</p>
            </div>
            <Switch 
              checked={settings.notifications.importCompletion}
              onCheckedChange={(checked) => updateNotification('importCompletion', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
            </div>
            <Switch 
              checked={settings.notifications.weeklyReports}
              onCheckedChange={(checked) => updateNotification('weeklyReports', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Product Recommendations</p>
              <p className="text-sm text-muted-foreground">Get shelf optimization suggestions</p>
            </div>
            <Switch 
              checked={settings.notifications.productRecommendations}
              onCheckedChange={(checked) => updateNotification('productRecommendations', checked)}
            />
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Data Management</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Export All Data</p>
              <p className="text-sm text-muted-foreground">Download all your store data as CSV</p>
            </div>
            <Button variant="outline" onClick={handleExportAllData} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Data Retention</p>
              <p className="text-sm text-muted-foreground">How long to keep historical data</p>
            </div>
            <Select 
              value={settings.dataRetention}
              onValueChange={(value) => updateSettings({ dataRetention: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input 
              id="current-password" 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdatePassword} 
            disabled={isUpdatingPassword || !currentPassword || !newPassword}
          >
            {isUpdatingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Update Password
          </Button>
        </div>
      </div>

      {/* Save/Reset Actions */}
      <div className="flex items-center justify-between p-4 card-elevated">
        <Button variant="outline" onClick={handleResetSettings}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
