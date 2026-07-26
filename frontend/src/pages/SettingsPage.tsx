import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Moon, Sun, LogOut, User as UserIcon, Lock, Palette } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUpdateProfile, useChangePassword } from '@/hooks/useSettings';
import { profileSchema, passwordSchema, ProfileFormValues, PasswordFormValues } from '@/utils/settingsSchemas';
import { getErrorMessage } from '@/utils/getErrorMessage';

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD'];

export default function SettingsPage() {
  const { user, updateCachedUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      resetProfile({ businessName: user.businessName, name: user.name, currency: user.currency });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const updated = await updateProfile.mutateAsync(values);
      updateCachedUser(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed');
      resetPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading title="Settings" description="Manage your business profile, security, and preferences" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FadeInSection delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4 text-primary" />
                  Business profile
                </CardTitle>
                <CardDescription>Your business name, your name, and default currency</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input id="businessName" {...registerProfile('businessName')} />
                    {profileErrors.businessName && (
                      <p className="text-sm text-destructive">{profileErrors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" {...registerProfile('name')} />
                    {profileErrors.name && <p className="text-sm text-destructive">{profileErrors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">Email can't be changed yet.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...registerProfile('currency')}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {profileErrors.currency && (
                      <p className="text-sm text-destructive">{profileErrors.currency.message}</p>
                    )}
                  </div>

                  <Button type="submit" isLoading={isProfileSubmitting}>
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeInSection>

          <div className="space-y-6">
            <FadeInSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4 text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current password</Label>
                      <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                      <Input id="confirmNewPassword" type="password" {...registerPassword('confirmNewPassword')} />
                      {passwordErrors.confirmNewPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" isLoading={isPasswordSubmitting}>
                      Change password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="h-4 w-4 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Switch between light and dark mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </span>
                    <Button variant="outline" onClick={toggleTheme}>
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      Switch to {theme === 'dark' ? 'light' : 'dark'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-base">Session</CardTitle>
                  <CardDescription>Sign out of BizPilot AI on this device</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={logout}>
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
