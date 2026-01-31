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

interface StoreFormData {
  name: string;
  phone: string;
  address: string;
  minOrder: number | null;
}

const INITIAL_STORE_FORM: StoreFormData = {
  name: '',
  phone: '',
  address: '',
  minOrder: null
};

const INITIAL_USER_FORM = {
  email: '',
  password: '',
  role: 'admin',
  store: ''
};

export default function SuperUserDashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Store dialog state
  const [openStoreDialog, setOpenStoreDialog] = useState(false);
  const [storeFormData, setStoreFormData] =
    useState<StoreFormData>(INITIAL_STORE_FORM);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Store deletion state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // User dialog state
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState(INITIAL_USER_FORM);

  // User deletion state
  const [openUserDeleteModal, setOpenUserDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

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

  const getStoreName = (tenantId: string) => {
    const store = stores.find((t) => t.id === tenantId);
    return store?.name || 'Unknown';
  };

  const resetStoreDialog = () => {
    setOpenStoreDialog(false);
    setEditingStore(null);
    setStoreFormData(INITIAL_STORE_FORM);
  };

  const resetUserDialog = () => {
    setOpenUserDialog(false);
    setUserFormData(INITIAL_USER_FORM);
  };

  const validateStoreForm = () => {
    if (
      !storeFormData.name.trim() ||
      !storeFormData.phone.trim() ||
      !storeFormData.address.trim() ||
      storeFormData.minOrder === null
    ) {
      toast.error('All fields are required');
      return false;
    }

    if (!isValidPhone(storeFormData.phone)) {
      toast.error('Invalid phone number format');
      return false;
    }

    return true;
  };

  async function handleStoreSubmit() {
    if (!validateStoreForm()) return;

    const supabase = createClient();
    const storeData = {
      name: storeFormData.name.trim(),
      phone_no: storeFormData.phone.trim(),
      address: storeFormData.address.trim(),
      min_order: storeFormData.minOrder
    };

    let error;
    if (editingStore) {
      const result = await supabase
        .from('tenants')
        .update(storeData)
        .eq('id', editingStore.id);
      error = result.error;
    } else {
      const result = await supabase.from('tenants').insert(storeData);
      error = result.error;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        editingStore
          ? toastMsg.dynamicUpdate('Store')
          : toastMsg.dynamicNew('Store')
      );
      resetStoreDialog();
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
      resetStoreDialog();
      await fetchStores();
    }
  }

  async function handleCreateUser() {
    if (
      !userFormData.email.trim() ||
      !userFormData.password.trim() ||
      !userFormData.store
    ) {
      alert('Please fill in all fields');
      return;
    }

    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userFormData.email,
        password: userFormData.password,
        tenantId: userFormData.store,
        role: userFormData.role
      })
    });

    if (response.ok) {
      resetUserDialog();
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
      await fetchUsers();
      setDeletingUser(null);
    } else {
      const error = await response.text();
      toast.error(error);
    }
  }

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreFormData({
      name: store.name,
      phone: store.phone_no,
      address: store.address,
      minOrder: store.min_order
    });
    setOpenStoreDialog(true);
  };

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
                          value={storeFormData.name}
                          onChange={(e) =>
                            setStoreFormData({
                              ...storeFormData,
                              name: e.target.value
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Phone Number
                        </label>
                        <Input
                          placeholder='Enter store phone no'
                          value={storeFormData.phone}
                          onChange={(e) =>
                            setStoreFormData({
                              ...storeFormData,
                              phone: e.target.value
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Address
                        </label>
                        <Input
                          placeholder='Enter store address'
                          value={storeFormData.address}
                          onChange={(e) =>
                            setStoreFormData({
                              ...storeFormData,
                              address: e.target.value
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Minimum Order
                        </label>
                        <Input
                          type='number'
                          placeholder='Enter minimum order limit'
                          value={storeFormData.minOrder ?? ''}
                          onChange={(e) =>
                            setStoreFormData({
                              ...storeFormData,
                              minOrder: e.target.value
                                ? Number(e.target.value)
                                : null
                            })
                          }
                        />
                      </div>

                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' onClick={resetStoreDialog}>
                          Cancel
                        </Button>
                        <Button onClick={handleStoreSubmit}>
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
            <CardContent className='flex flex-col space-y-4'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search stores'
                  className='pl-8'
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>

              <div className='max-h-[calc(75vh-8rem)] overflow-auto [&::-webkit-scrollbar-corner]:bg-transparent'>
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
                            onClick={() => handleEditStore(store)}
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
                          value={userFormData.email}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              email: e.target.value
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Password
                        </label>
                        <Input
                          type='password'
                          placeholder='Enter password'
                          value={userFormData.password}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              password: e.target.value
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='mb-2 block text-sm font-medium'>
                          Store
                        </label>
                        <Select
                          value={userFormData.store}
                          onValueChange={(value) =>
                            setUserFormData({ ...userFormData, store: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select a store' />
                          </SelectTrigger>
                          <SelectContent className='max-h-60 overflow-auto'>
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
                          value={userFormData.role}
                          onValueChange={(value) =>
                            setUserFormData({ ...userFormData, role: value })
                          }
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
                        <Button variant='outline' onClick={resetUserDialog}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col space-y-4'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search users'
                  className='pl-8'
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className='max-h-[calc(75vh-8rem)] overflow-auto [&::-webkit-scrollbar-corner]:bg-transparent'>
                <Table className='min-w-max'>
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
                                setDeletingUser(user);
                                setOpenUserDeleteModal(true);
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
