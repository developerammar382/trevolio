'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { FiTrash2, FiShield, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, roleFilter, currentPage]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            params.append('page', currentPage.toString());

            const response = await api.get(`/admin/users?${params.toString()}`);
            setUsers(response.data.data || []);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await api.put(`/admin/users/${user.id}/role`, { role: newRole });
                toast.success(`User role updated to ${newRole}`);
                fetchUsers();
            } catch (error) {
                console.error('Error updating role:', error);
                toast.error('Failed to update role');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Users</h1>
                    <p className="text-muted-foreground mt-1">Manage registered users and their roles ({total})</p>
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users (Name, Email)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <DataTable
                isLoading={loading}
                data={users}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage
                }}
                columns={[
                    {
                        header: 'Name',
                        accessorKey: 'name',
                        className: 'font-medium text-foreground'
                    },
                    {
                        header: 'Email',
                        accessorKey: 'email'
                    },
                    {
                        header: 'Role',
                        cell: (item) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {item.role}
                            </span>
                        )
                    },
                    {
                        header: 'Joined',
                        cell: (item) => new Date(item.created_at).toLocaleDateString()
                    },
                    {
                        header: 'Actions',
                        className: 'text-right',
                        cell: (item) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleRole(item); }}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Toggle Admin Role"
                                >
                                    <FiShield className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    title="Delete User"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
}
