import { useOutletContext } from 'react-router-dom';

const Dashboard = () => {
    const { user, role } = useOutletContext();

    return (
        <>
            <h1 className="h3 mb-3"><strong>Analytics</strong> Dashboard</h1>

            <div className="row">
                <div className="col-12 col-sm-6 col-xxl-3 d-flex">
                    <div className="card w-100 p-3">
                        <div className="row align-items-center">
                            <div className="col">
                                <h5 className="card-title text-muted mb-0">Total Orders</h5>
                                <span className="h2 font-weight-bold mb-0">120</span>
                            </div>
                            <div className="col-auto">
                                <div className="icon icon-shape bg-primary text-white text-lg rounded-circle">
                                    <i className="bi bi-box"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xxl-3 d-flex">
                    <div className="card w-100 p-3">
                        <div className="row align-items-center">
                            <div className="col">
                                <h5 className="card-title text-muted mb-0">On Progress</h5>
                                <span className="h2 font-weight-bold mb-0">24</span>
                            </div>
                            <div className="col-auto">
                                <div className="icon icon-shape bg-warning text-white text-lg rounded-circle">
                                    <i className="bi bi-clock"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xxl-3 d-flex">
                    <div className="card w-100 p-3">
                        <div className="row align-items-center">
                            <div className="col">
                                <h5 className="card-title text-muted mb-0">Completed</h5>
                                <span className="h2 font-weight-bold mb-0">90</span>
                            </div>
                            <div className="col-auto">
                                <div className="icon icon-shape bg-success text-white text-lg rounded-circle">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xxl-3 d-flex">
                    <div className="card w-100 p-3">
                        <div className="row align-items-center">
                            <div className="col">
                                <h5 className="card-title text-muted mb-0">Rework</h5>
                                <span className="h2 font-weight-bold mb-0">6</span>
                            </div>
                            <div className="col-auto">
                                <div className="icon icon-shape bg-danger text-white text-lg rounded-circle">
                                    <i className="bi bi-exclamation-triangle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-lg-8 d-flex">
                    <div className="card flex-fill">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Recent Orders Activity</h5>
                        </div>
                        <table className="table table-hover my-0">
                            <thead>
                                <tr>
                                    <th>Order No</th>
                                    <th className="d-none d-xl-table-cell">Customer</th>
                                    <th className="d-none d-xl-table-cell">Date</th>
                                    <th>Status</th>
                                    <th className="d-none d-md-table-cell">Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>ORD-001</td>
                                    <td className="d-none d-xl-table-cell">PT ABC</td>
                                    <td className="d-none d-xl-table-cell">01/01/2026</td>
                                    <td><span className="badge badge-completed">Completed</span></td>
                                    <td className="d-none d-md-table-cell">Vanessa</td>
                                </tr>
                                <tr>
                                    <td>ORD-002</td>
                                    <td className="d-none d-xl-table-cell">Bpk. John</td>
                                    <td className="d-none d-xl-table-cell">02/01/2026</td>
                                    <td><span className="badge badge-qc-svc">QC SVC</span></td>
                                    <td className="d-none d-md-table-cell">William</td>
                                </tr>
                                <tr>
                                    <td>ORD-003</td>
                                    <td className="d-none d-xl-table-cell">Hotel XYZ</td>
                                    <td className="d-none d-xl-table-cell">03/01/2026</td>
                                    <td><span className="badge badge-rework">Rework</span></td>
                                    <td className="d-none d-md-table-cell">John</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
