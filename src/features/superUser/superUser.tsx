// everything regarding super user is in this file
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Store {
  id: string;
  name: string;
}

interface User {
  id: string;
  user_email: string;
  role: string;
  tenant_id: string;
}

export default function SuperUserDashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [openStoreDialog, setOpenStoreDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [newUserStore, setNewUserStore] = useState('');

  const router = useRouter();

  // Fetch stores and users on mount
  useEffect(() => {
    fetchStores();
    fetchUsers();
  }, []);

  async function fetchStores() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tenants').select('*');
    if (error) {
      alert(error.message);
    } else {
      setStores(data || []);
    }
  }

  async function fetchUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('tenant_id', 'is', null);

    if (error) {
      alert(error.message);
    } else {
      setUsers(data || []);
    }
  }

  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      store.name.toLowerCase().includes(storeSearch.toLowerCase())
    );
  }, [stores, storeSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.user_email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  // Get store name by ID
  const getStoreName = (tenantId: string) => {
    const store = stores.find((t) => t.id === tenantId);
    return store?.name || 'Unknown';
  };

  async function handleCreateStore() {
    if (!newStoreName.trim()) {
      alert('Please enter a store name');
      return;
    }

    const supabase = await createClient();
    const { error } = await supabase.from('tenants').insert({
      name: newStoreName
    });

    if (error) {
      toast.error(error.message);
    } else {
      setOpenStoreDialog(false);
      setNewStoreName('');
      toast.success('New store has been added');
      await fetchStores();
    }
  }

  async function handleCreateUser() {
    if (!newUserEmail.trim() || !newUserPassword.trim() || !newUserStore) {
      alert('Please fill in all fields');
      return;
    }

    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUserEmail,
        password: newUserPassword,
        tenantId: newUserStore,
        role: newUserRole
      })
    });

    if (response.ok) {
      setOpenUserDialog(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserStore('');
      setNewUserRole('admin');
      await fetchUsers();
      toast.success('New user has been added');
    } else {
      const error = await response.text();
      toast.error(error);
    }
  }

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold tracking-tight'>NS Management</h1>
          <p className='mt-2 text-muted-foreground'>
            Manage stores and users in one place
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-2'>
          {/* STORES SECTION */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Stores</CardTitle>
                  <CardDescription>
                    {filteredStores.length} stores found
                  </CardDescription>
                </div>
                <Dialog
                  open={openStoreDialog}
                  onOpenChange={setOpenStoreDialog}
                >
                  <DialogTrigger asChild>
                    <Button className='gap-2'>
                      <Plus className='h-4 w-4' />
                      New Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Store</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Store Name
                        </label>
                        <Input
                          placeholder='Enter store name'
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                        />
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setOpenStoreDialog(false);
                            setNewStoreName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateStore}>
                          Create Store
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search stores...'
                  className='pl-8'
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>

              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.length === 0 ? (
                      <TableRow>
                        <TableCell className='py-6 text-center text-muted-foreground'>
                          No stores found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell className='font-medium'>
                            {store.name}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* USERS SECTION */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} users found
                  </CardDescription>
                </div>
                <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
                  <DialogTrigger asChild>
                    <Button className='gap-2'>
                      <Plus className='h-4 w-4' />
                      New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Email
                        </label>
                        <Input
                          type='email'
                          placeholder='user@example.com'
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Password
                        </label>
                        <Input
                          type='password'
                          placeholder='Enter password'
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Store
                        </label>
                        <Select
                          value={newUserStore}
                          onValueChange={setNewUserStore}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select a store' />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Role
                        </label>
                        <Select
                          value={newUserRole}
                          onValueChange={setNewUserRole}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='admin'>Admin</SelectItem>
                            <SelectItem value='super_admin'>
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setOpenUserDialog(false);
                            setNewUserEmail('');
                            setNewUserPassword('');
                            setNewUserStore('');
                            setNewUserRole('admin');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search users...'
                  className='pl-8'
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Store</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='py-6 text-center text-muted-foreground'
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className='font-medium'>
                            {user.user_email}
                          </TableCell>
                          <TableCell>
                            <span className='inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600'>
                              {user.role === 'super_admin'
                                ? 'Super Admin'
                                : 'Admin'}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {getStoreName(user.tenant_id)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
