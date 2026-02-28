import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal mengambil data user');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
            alert('Role berhasil diupdate');
        } catch (err) {
            alert('Gagal update role: ' + err.message);
        }
    };

    return (
        <>
            <h1 className="h3 mb-4">User Management</h1>

            <div className="card">
                <div className="card-header pb-0">
                    <h5 className="card-title">Daftar Pengguna Aplikasi</h5>
                    <p className="text-muted small">
                        Superadmin dapat mengubah role user. User baru secara default mendapatkan role "viewer".
                        Hanya user terdaftar di Supabase Auth yang akan muncul di sini (sinkronisasi via trigger).
                    </p>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Terdaftar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">Memuat data...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">Belum ada user.</td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{index + 1}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'ppic' ? 'bg-primary' : user.role === 'qc' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm d-inline-block w-auto"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="qc">QC</option>
                                                    <option value="ppic">PPIC</option>
                                                    <option value="superadmin">Superadmin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Users;
