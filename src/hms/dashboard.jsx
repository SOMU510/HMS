import React from 'react';

const Dashboard = () => {
  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Dashboard</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      {/* Dashboard Content */}
      <section className="section dashboard">
        <div className="row">
          {/* Left side columns */}
          <div className="col-lg-8">
            <div className="row">
              {/* Sales Card */}
              <div className="col-xxl-4 col-md-6">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Hostlers</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-people"></i>
                      </div>
                      <div className="ps-3">
                        <h6>145</h6>
                        <span className="text-success small pt-1 fw-bold">12%</span>
                        <span className="text-muted small pt-2 ps-1">increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="col-xxl-4 col-md-6">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Available Rooms</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-door-open"></i>
                      </div>
                      <div className="ps-3">
                        <h6>28</h6>
                        <span className="text-success small pt-1 fw-bold">8%</span>
                        <span className="text-muted small pt-2 ps-1">increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customers Card */}
              <div className="col-xxl-4 col-xl-12">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Staff</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-badge"></i>
                      </div>
                      <div className="ps-3">
                        <h6>32</h6>
                        <span className="text-danger small pt-1 fw-bold">2</span>
                        <span className="text-muted small pt-2 ps-1">on leave</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Recent Activity <span>| Today</span></h5>

                    <div className="activity">
                      <div className="activity-item d-flex">
                        <div className="activite-label">32 min</div>
                        <i className='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                        <div className="activity-content">
                          New hostler registration completed for <a href="#!" className="fw-bold text-dark">Room 205</a>
                        </div>
                      </div>

                      <div className="activity-item d-flex">
                        <div className="activite-label">56 min</div>
                        <i className='bi bi-circle-fill activity-badge text-danger align-self-start'></i>
                        <div className="activity-content">
                          Fee payment pending for <a href="#!" className="fw-bold text-dark">Student ID: 1234</a>
                        </div>
                      </div>

                      <div className="activity-item d-flex">
                        <div className="activite-label">2 hrs</div>
                        <i className='bi bi-circle-fill activity-badge text-primary align-self-start'></i>
                        <div className="activity-content">
                          Room maintenance completed for <a href="#!" className="fw-bold text-dark">Block A</a>
                        </div>
                      </div>

                      <div className="activity-item d-flex">
                        <div className="activite-label">1 day</div>
                        <i className='bi bi-circle-fill activity-badge text-info align-self-start'></i>
                        <div className="activity-content">
                          New staff member <a href="#!" className="fw-bold text-dark">John Doe</a> joined
                        </div>
                      </div>

                      <div className="activity-item d-flex">
                        <div className="activite-label">2 days</div>
                        <i className='bi bi-circle-fill activity-badge text-warning align-self-start'></i>
                        <div className="activity-content">
                          Visitor registered for <a href="#!" className="fw-bold text-dark">Room 102</a>
                        </div>
                      </div>

                      <div className="activity-item d-flex">
                        <div className="activite-label">4 weeks</div>
                        <i className='bi bi-circle-fill activity-badge text-muted align-self-start'></i>
                        <div className="activity-content">
                          System backup completed successfully
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side columns */}
          <div className="col-lg-4">
            {/* Recent Registrations */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Recent Registrations <span>| This Month</span></h5>

                <div className="activity">
                  <div className="activity-item d-flex">
                    <div className="activite-label">Today</div>
                    <i className='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                    <div className="activity-content">
                      <strong>John Smith</strong><br />
                      <small className="text-muted">Block A, Room 205</small>
                    </div>
                  </div>

                  <div className="activity-item d-flex">
                    <div className="activite-label">2 days</div>
                    <i className='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                    <div className="activity-content">
                      <strong>Emma Wilson</strong><br />
                      <small className="text-muted">Block B, Room 312</small>
                    </div>
                  </div>

                  <div className="activity-item d-flex">
                    <div className="activite-label">5 days</div>
                    <i className='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                    <div className="activity-content">
                      <strong>Michael Brown</strong><br />
                      <small className="text-muted">Block A, Room 101</small>
                    </div>
                  </div>

                  <div className="activity-item d-flex">
                    <div className="activite-label">1 week</div>
                    <i className='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                    <div className="activity-content">
                      <strong>Sarah Davis</strong><br />
                      <small className="text-muted">Block C, Room 405</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Report */}
            <div className="card">
              <div className="card-body pb-0">
                <h5 className="card-title">Monthly Statistics <span>| This Month</span></h5>

                <div id="budgetChart" style={{ minHeight: '400px' }} className="echart">
                  <div className="row gy-4">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>145</h6>
                          <span className="text-muted small pt-2">Total Hostlers</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>52</h6>
                          <span className="text-muted small pt-2">Total Rooms</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>28</h6>
                          <span className="text-muted small pt-2">Available Rooms</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>24</h6>
                          <span className="text-muted small pt-2">Occupied Rooms</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>32</h6>
                          <span className="text-muted small pt-2">Staff Members</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="ps-3">
                          <h6>18</h6>
                          <span className="text-muted small pt-2">Visitors Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
