import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const OrderDetail = () => {
    const { id } = useParams();
    const { role } = useOutletContext();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // QC Form State
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [qcForm, setQcForm] = useState({
        stage: 'svc',
        status: 'pass',
        notes: '',
        image: null
    });
    const [submittingQc, setSubmittingQc] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            // Fetch Order info
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select(`*, users ( email )`)
                .eq('id', id)
                .single();
            if (orderError) throw orderError;
            setOrder(orderData);

            // Fetch Items + QC Records
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select(`
          id, item_name, quantity, status, created_at,
          qc_records ( stage, status, notes, qc_image_url, created_at, users (email) )
        `)
                .eq('order_id', id)
                .order('created_at', { ascending: true });

            if (itemsError) throw itemsError;
            setItems(itemsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQcSubmit = async (e) => {
        e.preventDefault();
        setSubmittingQc(true);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user.id;
            let imageUrl = null;

            if (qcForm.image) {
                // Compress Image
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(qcForm.image, options);

                // Upload to Supabase Storage
                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${selectedItemId}-${Date.now()}.${fileExt}`;
                const filePath = `qc-images/${fileName}`;

                // Assuming bucket name is 'uploads'
                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(filePath);
                imageUrl = publicUrl;
            }

            // Insert QC Record
            const { error: qcError } = await supabase
                .from('qc_records')
                .insert({
                    order_item_id: selectedItemId,
                    stage: qcForm.stage,
                    status: qcForm.status,
                    notes: qcForm.notes,
                    qc_image_url: imageUrl,
                    created_by: userId
                });

            if (qcError) throw qcError;

            // Reset form and refetch
            setQcForm({ stage: 'svc', status: 'pass', notes: '', image: null });
            setSelectedItemId(null);
            await fetchOrderDetail();
            alert('QC Record berhasil ditambahkan!');
        } catch (err) {
            console.error(err);
            alert('Gagal submit QC: ' + err.message);
        } finally {
            setSubmittingQc(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order tidak ditemukan.</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'on_progress': return <span className="badge bg-warning text-dark">On Progress</span>;
            case 'completed': return <span className="badge bg-success">Completed</span>;
            case 'rework': return <span className="badge bg-danger">Rework</span>;
            case 'pending': return <span className="badge bg-secondary">Pending QC</span>;
            case 'qc_svc': return <span className="badge bg-info">QC SVC Passed</span>;
            case 'qc_aksesoris': return <span className="badge bg-warning text-dark">QC Aksesoris Passed</span>;
            case 'qc_finishing': return <span className="badge bg-primary">QC Finishing Passed</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const getNextStageOption = (currentStatus) => {
        if (currentStatus === 'pending' || currentStatus === 'rework') return 'svc';
        if (currentStatus === 'qc_svc') return 'aksesoris';
        if (currentStatus === 'qc_aksesoris') return 'finishing';
        return null; // Completed or waiting
    };

    return (
        <>
            <div className="mb-4">
                <Link to="/orders" className="btn btn-light btn-sm mb-3">
                    <ArrowLeft size={16} className="me-1" /> Kembali ke Daftar
                </Link>
                <h1 className="h3 mb-2">Detail Order: <strong>{order.order_number}</strong></h1>
                <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted">Customer: {order.customer_name}</span>
                    <span className="text-muted">|</span>
                    {getStatusBadge(order.status)}
                </div>
            </div>

            <div className="row">
                {items.map(item => {
                    const sortedQc = [...item.qc_records].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    const nextStage = getNextStageOption(item.status);

                    return (
                        <div className="col-12 col-xl-6 d-flex" key={item.id}>
                            <div className="card flex-fill">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">{item.item_name} (Qty: {item.quantity})</h5>
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="card-body">
                                    <ul className="timeline">
                                        {sortedQc.length === 0 && (
                                            <li className="text-muted small">Belum ada proses QC.</li>
                                        )}
                                        {sortedQc.map((qc, idx) => (
                                            <li key={idx}>
                                                <div className={`timeline-icon ${qc.status === 'pass' ? 'bg-success' : 'bg-danger'}`}>
                                                    {qc.status === 'pass' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                                </div>
                                                <div className="fw-bold text-uppercase">{qc.stage} - {qc.status === 'pass' ? 'PASS' : 'REJECT'}</div>
                                                <div className="text-muted small mb-1">{new Date(qc.created_at).toLocaleString('id-ID')} by {qc.users?.email}</div>
                                                {qc.notes && <p className="mb-1 small">{qc.notes}</p>}
                                                {qc.qc_image_url && (
                                                    <a href={qc.qc_image_url} target="_blank" rel="noreferrer">
                                                        <img src={qc.qc_image_url} alt="QC Result" className="img-thumbnail" style={{ height: '80px', objectFit: 'cover' }} />
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {['qc', 'superadmin'].includes(role) && item.status !== 'completed' && nextStage && (
                                        <div className="mt-3">
                                            {selectedItemId !== item.id ? (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        setSelectedItemId(item.id);
                                                        setQcForm({ ...qcForm, stage: nextStage });
                                                    }}
                                                >
                                                    + Tambah QC ({nextStage.toUpperCase()})
                                                </button>
                                            ) : (
                                                <div className="bg-light p-3 rounded mt-2 border">
                                                    <h6 className="fw-bold mb-3">Input Hasil QC: {nextStage.toUpperCase()}</h6>
                                                    <form onSubmit={handleQcSubmit}>
                                                        <div className="mb-2">
                                                            <label className="form-label small">Hasil</label>
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={qcForm.status}
                                                                onChange={e => setQcForm({ ...qcForm, status: e.target.value })}
                                                            >
                                                                <option value="pass">PASS</option>
                                                                <option value="reject">REJECT (Rework)</option>
                                                            </select>
                                                        </div>
                                                        <div className="mb-2">
                                                            <label className="form-label small">Catatan</label>
                                                            <textarea
                                                                className="form-control form-control-sm"
                                                                rows="2"
                                                                value={qcForm.notes}
                                                                onChange={e => setQcForm({ ...qcForm, notes: e.target.value })}
                                                            ></textarea>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label small">Foto Evidence (Max 5MB, otomatis compress ke 1MB)</label>
                                                            <input
                                                                type="file"
                                                                className="form-control form-control-sm"
                                                                accept="image/*"
                                                                onChange={e => setQcForm({ ...qcForm, image: e.target.files[0] })}
                                                            />
                                                        </div>
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button type="button" className="btn btn-sm btn-light" onClick={() => setSelectedItemId(null)}>Batal</button>
                                                            <button type="submit" className="btn btn-sm btn-primary" disabled={submittingQc}>
                                                                {submittingQc ? 'Menyimpan...' : 'Simpan QC'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {['qc', 'superadmin'].includes(role) && item.status === 'rework' && (
                                        <div className="mt-3">
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    setSelectedItemId(item.id);
                                                    setQcForm({ ...qcForm, stage: nextStage || 'svc' }); // Start over or specific stage
                                                }}
                                            >
                                                + Input QC Rework (Mulai ulang stage)
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default OrderDetail;
