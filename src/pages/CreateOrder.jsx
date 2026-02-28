import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Plus, Trash2 } from 'lucide-react';

const CreateOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [orderData, setOrderData] = useState({
        customer_name: '',
        po_source: '',
    });

    const [items, setItems] = useState([{ item_name: '', quantity: 1 }]);

    const handleAddItem = () => {
        setItems([...items, { item_name: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate
        if (items.some(i => !i.item_name || i.quantity < 1)) {
            setError('Harap lengkapi semua item dengan benar');
            setLoading(false);
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user.id;

            const orderNumber = `ORD-${new Date().getTime().toString().slice(-6)}`;

            // 1. Insert Order
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_name: orderData.customer_name,
                    po_source: orderData.po_source,
                    created_by: userId,
                    status: 'on_progress'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert Items
            const itemsToInsert = items.map(item => ({
                order_id: newOrder.id,
                item_name: item.item_name,
                quantity: parseInt(item.quantity)
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // Navigate to order details
            navigate(`/orders/${newOrder.id}`);

        } catch (err) {
            setError(err.message || 'Gagal membuat order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Create New Order</h1>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <div className="card-header pb-0">
                        <h5 className="card-title">Order Information</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Customer Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={orderData.customer_name}
                                    onChange={e => setOrderData({ ...orderData, customer_name: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">PO / Source Note</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={orderData.po_source}
                                    onChange={e => setOrderData({ ...orderData, po_source: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header pb-0 d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Order Items</h5>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th width="60%">Item Name</th>
                                    <th width="20%">Quantity</th>
                                    <th width="20%">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder="Nama Furniture"
                                                value={item.item_name}
                                                onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                required
                                                value={item.quantity}
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="d-flex justify-content-end mb-4">
                    <button type="button" className="btn btn-light me-2" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Save Order'}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateOrder;
