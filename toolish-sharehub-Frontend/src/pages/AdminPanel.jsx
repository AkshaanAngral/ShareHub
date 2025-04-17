
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, UserCheck, Settings, Shield } from "lucide-react";

const AdminPanel = () => {
  const [searchUsers, setSearchUsers] = useState("");
  const [searchTools, setSearchTools] = useState("");
  
  // Mock data - in a real app this would come from an API
  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active", role: "user", joined: "2023-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", role: "user", joined: "2023-02-20" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "suspended", role: "user", joined: "2023-03-10" },
    { id: 4, name: "Sarah Williams", email: "sarah@example.com", status: "active", role: "admin", joined: "2023-01-05" },
  ];

  const mockTools = [
    { id: 1, name: "Electric Drill", owner: "John Doe", category: "Power Tools", status: "available", price: 15 },
    { id: 2, name: "Chainsaw", owner: "Jane Smith", category: "Power Tools", status: "rented", price: 25 },
    { id: 3, name: "Lawn Mower", owner: "Mike Johnson", category: "Outdoor", status: "available", price: 20 },
    { id: 4, name: "Pressure Washer", owner: "Sarah Williams", category: "Outdoor", status: "maintenance", price: 22 },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) || 
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredTools = mockTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTools.toLowerCase()) || 
    tool.owner.toLowerCase().includes(searchTools.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage users, tools, and platform settings</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <UserCheck className="mr-2 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> Tools
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" /> Platform Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Add User</Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "outline" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            {user.status === "active" ? (
                              <Button variant="ghost" size="sm">Suspend</Button>
                            ) : (
                              <Button variant="ghost" size="sm">Activate</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tools Management</CardTitle>
              <CardDescription>Manage tools listed on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    className="pl-8"
                    value={searchTools}
                    onChange={(e) => setSearchTools(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tools</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price ($/day)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTools.map((tool) => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell>{tool.owner}</TableCell>
                        <TableCell>{tool.category}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              tool.status === "available" ? "default" : 
                              tool.status === "rented" ? "secondary" : "outline"
                            }
                          >
                            {tool.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${tool.price}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure global platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Name</label>
                    <Input defaultValue="ToolsShare" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input defaultValue="support@toolsshare.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <Select defaultValue="usd">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Date Format</label>
                    <Select defaultValue="mdy">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fees & Commission</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Fee (%)</label>
                    <Input type="number" defaultValue="10" min="0" max="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rental Price ($)</label>
                    <Input type="number" defaultValue="5" min="1" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
