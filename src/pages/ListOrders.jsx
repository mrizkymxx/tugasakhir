import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';

const ListOrders = () => {
    const { role } = useOutletContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          id,
          order_number,
          customer_name,
          status,
          created_at,
          users ( email )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'on_progress': return <span className="badge bg-warning text-dark">On Progress</span>;
            case 'completed': return <span className="badge bg-success">Completed</span>;
            case 'rework': return <span className="badge bg-danger">Rework</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Daftar Order</h1>
                {['superadmin', 'ppic'].includes(role) && (
                    <Link to="/orders/create" className="btn btn-primary d-flex align-items-center gap-2">
                        <Plus size={16} /> Order Baru
                    </Link>
                )}
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>No Order</th>
                                    <th>Customer</th>
                                    <th>Tanggal</th>
                                    <th>Dibuat Oleh</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">Memuat data...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">Belum ada order.</td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>{order.order_number}</strong></td>
                                            <td>{order.customer_name}</td>
                                            <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                            <td>{order.users?.email || '-'}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
                                                    <Eye size={16} /> Detail
                                                </Link>
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

export default ListOrders;
