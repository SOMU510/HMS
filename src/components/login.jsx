import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7291/api/Auth/LoginUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          loginId: loginId,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Login failed (Status: ${response.status})`);
      }

      const data = await response.json();

      if (data.token) {
        // Token already includes "Bearer " prefix from API
        const token = data.token.startsWith('Bearer ') ? data.token : `Bearer ${data.token}`;
        
        localStorage.setItem(
          'user',
          JSON.stringify({
            LoginId: data.user.loginId,
            role: data.user.role,
            profile_Pic_Path: data.user.profile_Pic_Path || '',
          })
        );
        localStorage.setItem('token', token);

        navigate('/hms/dashboard');
      } else {
        setError('Invalid loginId or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Better error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the API server is running at https://localhost:7291';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Cannot reach the server. Check if the API is running and accessible.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
              <div className="d-flex justify-content-center py-4">
                <a href="/" className="logo d-flex align-items-center w-auto">
                  <span className="d-none d-lg-block">HMS</span>
                </a>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                    <p className="text-center small">Enter your login ID & password to login</p>
                  </div>

                  <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
                    <div className="col-12">
                      <label htmlFor="yourUsername" className="form-label">Login ID</label>
                      <div className="input-group has-validation">
                        <span className="input-group-text" id="inputGroupPrepend">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          name="username"
                          className="form-control"
                          id="yourUsername"
                          required
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          autoFocus
                        />
                        <div className="invalid-feedback">Please enter your login ID.</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="yourPassword" className="form-label">Password</label>
                      <div className="input-group has-validation">
                        <span className="input-group-text" id="inputGroupPrepend2">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          id="yourPassword"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="invalid-feedback">Please enter your password!</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="remember"
                          value="true"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="col-12">
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing In...
                          </>
                        ) : (
                          'Login'
                        )}
                      </button>
                    </div>

                    <div className="col-12">
                      <p className="small mb-0">
                        Don't have account? <a href="#!">Create an account</a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              <div className="credits">
                <p className="text-center small text-muted">
                  © Copyright <strong>HMS</strong>. All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginForm;
