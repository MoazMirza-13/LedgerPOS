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
import { Plus, Search, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { isValidPhone, toastMsg } from '@/utils/utils';
import { AlertModal } from '@/components/modal/alert-modal';

interface Store {
  id: string;
  name: string;
  phone_no: string;
  address: string;
  min_order: number;
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
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreMinOrder, setNewStoreMinOrder] = useState<number | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [newUserStore, setNewUserStore] = useState('');

  const [openUserDeleteModal, setOpenUserDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

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
    if (
      !newStoreName.trim() ||
      !newStorePhone.trim() ||
      !newStoreAddress.trim() ||
      newStoreMinOrder === null
    ) {
      toast.error('All fields are required');
      return;
    }

    if (!isValidPhone(newStorePhone)) {
      toast.error('Invalid phone number format');
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.from('tenants').insert({
      name: newStoreName.trim(),
      phone_no: newStorePhone.trim(),
      address: newStoreAddress.trim(),
      min_order: newStoreMinOrder
    });

    if (error) {
      toast.error(error.message);
    } else {
      setOpenStoreDialog(false);
      setNewStoreName('');
      setNewStorePhone('');
      setNewStoreAddress('');
      setNewStoreMinOrder(null);
      toast.success(toastMsg.dynamicNew('Store'));
      await fetchStores();
    }
  }

  async function handleUpdateStore() {
    if (!editingStore) return;

    if (
      !newStoreName.trim() ||
      !newStorePhone.trim() ||
      !newStoreAddress.trim() ||
      newStoreMinOrder === null
    ) {
      toast.error('All fields are required');
      return;
    }

    if (!isValidPhone(newStorePhone)) {
      toast.error('Invalid phone number format');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('tenants')
      .update({
        name: newStoreName.trim(),
        phone_no: newStorePhone.trim(),
        address: newStoreAddress.trim(),
        min_order: newStoreMinOrder
      })
      .eq('id', editingStore.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(toastMsg.dynamicUpdate('Store'));
      setOpenStoreDialog(false);
      setEditingStore(null);
      setNewStoreName('');
      setNewStorePhone('');
      setNewStoreAddress('');
      setNewStoreMinOrder(null);
      await fetchStores();
    }
  }

  async function handleDeleteStore() {
    if (!deletingStore) return;

    setDeleteLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', deletingStore.id);

    setDeleteLoading(false);
    setOpenDeleteModal(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(toastMsg.deleteItem);
      setOpenStoreDialog(false);
      setEditingStore(null);
      setNewStoreName('');
      setNewStorePhone('');
      setNewStoreAddress('');
      setNewStoreMinOrder(null);
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
      toast.success(toastMsg.dynamicNew('User'));
    } else {
      const error = await response.text();
      toast.error(error);
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;

    setDeleteUserLoading(true);

    const response = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: deletingUser?.id })
    });

    setDeleteUserLoading(false);
    setOpenUserDeleteModal(false);

    if (response.ok) {
      toast.success('User deleted successfully');
      await fetchUsers(); // refresh user list
      setDeletingUser(null);
    } else {
      const error = await response.text();
      toast.error(error);
    }
  }

  return (
    <div className='min-h-screen bg-background p-4'>
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDeleteStore}
        loading={deleteLoading}
      />

      <AlertModal
        isOpen={openUserDeleteModal}
        onClose={() => setOpenUserDeleteModal(false)}
        onConfirm={handleDeleteUser}
        loading={deleteUserLoading}
      />

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
                      <DialogTitle>
                        {editingStore ? 'Update Store' : 'Create New Store'}
                      </DialogTitle>
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
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Phone Number
                        </label>
                        <Input
                          placeholder='Enter store phone no'
                          value={newStorePhone}
                          onChange={(e) => setNewStorePhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Address
                        </label>
                        <Input
                          placeholder='Enter store address'
                          value={newStoreAddress}
                          onChange={(e) => setNewStoreAddress(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Minimum Order
                        </label>
                        <Input
                          type='number'
                          placeholder='Enter minimum order limit'
                          onChange={(e) =>
                            setNewStoreMinOrder(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </div>

                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setOpenStoreDialog(false);
                            setEditingStore(null);
                            setNewStoreName('');
                            setNewStorePhone('');
                            setNewStoreAddress('');
                            setNewStoreMinOrder(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={
                            editingStore ? handleUpdateStore : handleCreateStore
                          }
                        >
                          {editingStore ? 'Update Store' : 'Create Store'}
                        </Button>

                        {editingStore && (
                          <Button
                            variant='destructive'
                            onClick={() => {
                              setDeletingStore(editingStore);
                              setOpenDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        )}
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
                  placeholder='Search stores'
                  className='pl-8'
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>

              <div className='overflow-x-auto'>
                {/* or try layout fixed class */}
                <Table className='min-w-max'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='py-6 text-center text-muted-foreground'
                        >
                          No stores found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell
                            className='cursor-pointer font-medium'
                            onClick={() => {
                              setEditingStore(store);
                              setNewStoreName(store.name);
                              setNewStorePhone(store.phone_no);
                              setNewStoreAddress(store.address);
                              setNewStoreMinOrder(store.min_order);
                              setOpenStoreDialog(true);
                            }}
                          >
                            {store.name}
                          </TableCell>

                          <TableCell className='text-sm text-muted-foreground'>
                            {store.phone_no}
                          </TableCell>

                          <TableCell className='font-medium'>
                            {store.min_order}
                          </TableCell>

                          <TableCell className='text-sm'>
                            {store.address}
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
                  placeholder='Search users'
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

                          <TableCell>
                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => {
                                setDeletingUser(user); // new state for selected user
                                setOpenUserDeleteModal(true); // new modal state
                              }}
                            >
                              <Trash size={16} />
                            </Button>
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
