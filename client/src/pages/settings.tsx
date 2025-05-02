import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  company: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  jobReminders: z.boolean().default(true),
  invoiceReminders: z.boolean().default(true),
  paymentNotifications: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isNotificationSaving, setIsNotificationSaving] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Miller",
      email: "john@example.com",
      company: "Freelance Design",
      website: "johnmiller.design",
      phone: "555-123-4567",
    },
  });

  // Notifications form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      jobReminders: true,
      invoiceReminders: true,
      paymentNotifications: true,
    },
  });

  function onProfileSubmit(data: ProfileFormValues) {
    setIsProfileSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsProfileSaving(false);
    }, 800);
  }

  function onNotificationSubmit(data: NotificationFormValues) {
    setIsNotificationSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
      setIsNotificationSaving(false);
    }, 800);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Profile picture"
                  />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <div>
                  <Button className="mb-2">Upload new image</Button>
                  <p className="text-sm text-gray-500">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" disabled={isProfileSaving}>
                      {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive system notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="jobReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Job Reminders</FormLabel>
                            <FormDescription>
                              Get notified about upcoming job deadlines
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="invoiceReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Invoice Reminders</FormLabel>
                            <FormDescription>
                              Get reminders about unpaid and upcoming invoices
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="paymentNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Payment Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications when payments are received
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" disabled={isNotificationSaving}>
                      {isNotificationSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Notification Settings
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Manage your billing information and view your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 px-6">
                <h3 className="text-lg font-medium mb-2">Billing settings will be available soon</h3>
                <p className="text-gray-500 mb-4">
                  We're working on adding billing settings to make it easier to manage your account.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 px-6">
                <h3 className="text-lg font-medium mb-2">Security settings will be available soon</h3>
                <p className="text-gray-500 mb-4">
                  We're working on adding security settings to help keep your account safe.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
