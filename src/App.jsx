import { useState, useEffect } from 'react';

// Master initial catalog shared dataset seed values
const defaultCourses = [
  { id: "cs-101", title: "Introduction to React 19", department: "Computer Science", credits: 4, openSeats: 5 },
  { id: "ds-204", title: "Data Structures & Algorithms", department: "Computer Science", credits: 4, openSeats: 2 },
  { id: "ux-110", title: "UI/UX Interface Systems", department: "Design", credits: 3, openSeats: 12 }
];

// Master administrator profile account configuration seed
const initialUsers = [
  { username: "admin", password: "admin123", role: "admin" }
];

export default function App() {
  // --- AUTHENTICATION & PORTAL SESSION STATES ---
  const [sessionUser, setSessionUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- USER IDENTITY DATABASE STATE ---
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('edu_sys_users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');

  // --- COURSE SCHEDULING MANAGEMENT STATES ---
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('edu_sys_courses');
    return saved ? JSON.parse(saved) : defaultCourses;
  });

  const [studentCart, setStudentCart] = useState([]);
  
  // Single relational enrollment collection mapping: { username, courseId, title, credits }
  const [enrollments, setEnrollments] = useState(() => {
    const saved = localStorage.getItem('edu_sys_enrollments_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [newCourse, setNewCourse] = useState({ title: '', department: 'Computer Science', credits: 3, openSeats: 10 });

  // --- LOCAL CACHE PERSISTENCE ENGINE SYNC ---
  useEffect(() => {
    localStorage.setItem('edu_sys_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('edu_sys_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('edu_sys_enrollments_v2', JSON.stringify(enrollments));
  }, [enrollments]);

  // --- CORE SYSTEM EVENT HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const matchedUser = users.find(
      u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput
    );

    if (matchedUser) {
      setSessionUser({ username: matchedUser.username, role: matchedUser.role });
    } else {
      alert("Access Denied: Invalid Username or Password string signature.");
    }
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setStudentCart([]);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      alert("Conflict Error: This Username ID is already registered inside the institutional index.");
      return;
    }

    const accountPayload = {
      username: newUsername.trim().toLowerCase(),
      password: newPassword,
      role: newUserRole
    };

    setUsers([...users, accountPayload]);
    alert(`Success: Secure credentials provisioned for User account ID '${newUsername}'!`);
    setNewUsername('');
    setNewPassword('');
    setNewUserRole('student');
  };

  const handleAdminCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    const formattedCourse = {
      id: `crs-${Math.random().toString(36).substring(2, 6)}`,
      title: newCourse.title,
      department: newCourse.department,
      credits: parseInt(newCourse.credits),
      openSeats: parseInt(newCourse.openSeats)
    };

    setCourses([...courses, formattedCourse]);
    setNewCourse({ title: '', department: 'Computer Science', credits: 3, openSeats: 10 });
  };

  const handleAdminDeleteCourse = (id) => {
    if (window.confirm("Are you sure you want to completely remove this course from the list?")) {
      setCourses(courses.filter(c => c.id !== id));
      setEnrollments(enrollments.filter(e => e.courseId !== id));
      setStudentCart(studentCart.filter(c => c.id !== id));
    }
  };

  const handleStudentAddToCart = (course) => {
    const isEnrolled = enrollments.some(e => e.username === sessionUser.username && e.courseId === course.id);
    if (studentCart.some(item => item.id === course.id)) return alert("Course already exists inside schedule queue.");
    if (isEnrolled) return alert("You are already enrolled inside this module.");
    if (course.openSeats <= 0) return alert("System Warning: No remaining seat spaces open.");

    const totalCredits = studentCart.reduce((sum, item) => sum + item.credits, 0);
    if (totalCredits + course.credits > 12) return alert("Credit cap threshold constraint error: Cannot exceed 12 credits.");

    setStudentCart([...studentCart, course]);
  };

  const handleStudentCheckout = () => {
    setCourses(courses.map(c => {
      const match = studentCart.find(item => item.id === c.id);
      return match ? { ...c, openSeats: c.openSeats - 1 } : c;
    }));

    const newEnrollmentRecords = studentCart.map(item => ({
      username: sessionUser.username,
      courseId: item.id,
      title: item.title,
      credits: item.credits
    }));

    setEnrollments([...enrollments, ...newEnrollmentRecords]);
    setStudentCart([]);
  };

  const handleStudentDropCourse = (courseId) => {
    if (window.confirm("Drop this validated course record?")) {
      setEnrollments(enrollments.filter(e => !(e.username === sessionUser.username && e.courseId === courseId)));
      setCourses(courses.map(c => c.id === courseId ? { ...c, openSeats: c.openSeats + 1 } : c));
    }
  };

  const currentCartCredits = studentCart.reduce((sum, item) => sum + item.credits, 0);
  const studentAccounts = users.filter(u => u.role === 'student');

  // --- REUSABLE INTERFACE STRUCTURAL DESIGN CONTEXT SHADOWS ---
  const panelStyle = {
    background: '#ffffff', padding: '30px', borderRadius: '16px',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box', marginBottom: '30px'
  };

  const inputStyle = {
    padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box',
    backgroundColor: '#ffffff', color: '#0f172a'
  };

  const labelStyle = {
    fontSize: '0.8rem', fontWeight: '700', color: '#475569',
    textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px'
  };

  // --- INTERFACE SCREEN RENDERING CONTROLLERS ---
  if (!sessionUser) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f0f4f8', fontFamily: "'Inter', system-ui, sans-serif", zIndex: 99999
      }}>
        <div style={{
          background: '#ffffff', width: '100%', maxWidth: '380px', padding: '40px',
          borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0', boxSizing: 'border-box'
        }}>
          <header style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#1e3a8a', margin: '0 0 6px 0', fontWeight: '700' }}>EduFlex Hub 🔐</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Institutional Access Gateway</p>
          </header>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Username ID</label>
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Enter Username ID..." required style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Account Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Enter Account Password..." required style={{ ...inputStyle, paddingRight: '45px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}>
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("System Message: Please contact your institutional system Administrator to securely reset your account credentials."); }} style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" style={{ background: '#1e3a8a', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', width: '100%' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', system-ui, sans-serif", boxSizing: 'border-box' }}>
      
      {/* GLOBAL APPLICATION CONTROL NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '18px 30px', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '35px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0, fontWeight: '700' }}>EduFlex Portal 🎓</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '5px 12px', borderRadius: '6px', background: sessionUser.role === 'admin' ? '#fef2f2' : '#eff6ff', color: sessionUser.role === 'admin' ? '#b91c1c' : '#1e40af', border: '1px solid currentColor', letterSpacing: '0.5px' }}>
            {sessionUser.role.toUpperCase()} WORKSPACE ({sessionUser.username})
          </span>
        </div>
        <button onClick={handleLogout} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 18px', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}>
          Logout 🚪
        </button>
      </nav>

      {/* REGION 1: BALANCED ADMINISTRATOR CAPABILITIES CONTROL PANEL LAYOUT */}
      {sessionUser.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* PRIVILEGE MODULE A: IDENTITY MANAGEMENT SYSTEM */}
          <section style={{ ...panelStyle, borderTop: '4px solid #4f46e5' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700' }}>👤 Identity Management Form (Admin Privilege Only)</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <label style={labelStyle}>Assign Username</label>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="e.g., student_id" required style={inputStyle} />
              </div>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <label style={labelStyle}>Assign Security Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set access code..." required style={inputStyle} />
              </div>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <label style={labelStyle}>Assign Portal Permissions Role</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={inputStyle}>
                  <option value="student">Student Portal Role</option>
                  <option value="admin">Administrator Role</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#4f46e5', color: 'white', padding: '13px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                Deploy New User Account
              </button>
            </form>
          </section>

          {/* PRIVILEGE MODULE B: STUDENT TRANSACTION PROFILE ENGINE LIST */}
          <section style={{ ...panelStyle, borderTop: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700' }}>👥 Active Student Directory & Registered Courses ({studentAccounts.length} Students)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Student Username ID</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Account Access Password</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Registered Course Modules Taken</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Total Active Credit Load</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAccounts.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No students registered in the institutional database records yet.</td></tr>
                  ) : (
                    studentAccounts.map(student => {
                      const coursesTaken = enrollments.filter(e => e.username === student.username);
                      const totalCredits = coursesTaken.reduce((sum, c) => sum + c.credits, 0);
                      return (
                        <tr key={student.username} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}><span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', color: '#1e293b' }}>🎓 {student.username}</span></td>
                          <td style={{ padding: '14px 16px' }}><code style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{student.password}</code></td>
                          <td style={{ padding: '14px 16px' }}>
                            {coursesTaken.length === 0 ? (
                              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Zero Enrollments Placed</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {coursesTaken.map((c, i) => (
                                  <span key={i} style={{ background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', width: 'max-content', fontWeight: '500' }}>
                                    📘 {c.title} ({c.credits} Cr)
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: totalCredits > 0 ? '#10b981' : '#64748b', fontSize: '0.95rem' }}>{totalCredits} / 12 Units</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PRIVILEGE MODULE C: COURSE TICKETING PROVISIONER FORM */}
          <section style={panelStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700' }}>🔨 Add New Semester Course Ticket</h3>
            <form onSubmit={handleAdminCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Course Lecture Title</label>
                <input type="text" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="e.g., Enterprise Architecture Systems" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={labelStyle}>Department Core</label>
                  <select value={newCourse.department} onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })} style={inputStyle}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Design">Design</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={labelStyle}>Academic Credits</label>
                  <input type="number" min="1" max="5" value={newCourse.credits} onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={labelStyle}>Seat Capacity</label>
                  <input type="number" min="1" max="60" value={newCourse.openSeats} onChange={(e) => setNewCourse({ ...newCourse, openSeats: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={{ background: '#0f172a', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', alignSelf: 'flex-start' }}>
                Publish Course to Registry
              </button>
            </form>
          </section>

          {/* PRIVILEGE MODULE D: REGISTRY ARCHIVE INVENTORY TRACKING PANEL */}
          <section style={panelStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700' }}>📋 Registry Inventory Management Panel</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>ID</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Course Title</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Department</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Credits</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Available Seats</th>
                    <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '700' }}>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}><code style={{ color: '#4f46e5', fontWeight: '600' }}>{c.id.toUpperCase()}</code></td>
                      <td style={{ padding: '14px 16px' }}><strong>{c.title}</strong></td>
                      <td style={{ padding: '14px 16px' }}>{c.department}</td>
                      <td style={{ padding: '14px 16px' }}>{c.credits} Units</td>
                      <td style={{ padding: '14px 16px' }}>{c.openSeats} Seats remaining</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleAdminDeleteCourse(c.id)} style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}>
                          Remove 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}

      {/* REGION 2: STUDENT REGISTRATION INTERFACE FLOW PIPELINE */}
      {sessionUser.role === 'student' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* MAIN COLUMN AREA */}
          <main style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSizing: '1.2rem', fontWeight: '700' }}>📚 Active Semester Lecture Catalog</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
              {courses.map(course => {
                const isEnrolled = enrollments.some(e => e.username === sessionUser.username && e.courseId === course.id);
                return (
                  <div key={course.id} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '190px', background: isEnrolled ? '#f8fafc' : '#ffffff' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '4px', width: 'max-content', textTransform: 'uppercase' }}>{course.department}</span>
                    <h4 style={{ fontSize: '1rem', margin: '10px 0 2px 0', color: '#1e293b', fontWeight: '600' }}>{course.title}</h4>
                    <small style={{ color: '#64748b', fontFamily: 'monospace' }}>Code: {course.id.toUpperCase()}</small>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', margin: '12px 0' }}>
                      <span style={{ color: '#475569' }}>💳 {course.credits} Credits</span>
                      <span style={{ color: course.openSeats <= 2 ? '#dc2626' : '#10b981' }}>👥 {course.openSeats} Seats</span>
                    </div>
                    <button onClick={() => handleStudentAddToCart(course)} disabled={course.openSeats === 0 || isEnrolled} style={{ background: isEnrolled ? '#e2e8f0' : '#2563eb', color: isEnrolled ? '#94a3b8' : 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                      {isEnrolled ? "✓ Enrolled" : course.openSeats === 0 ? "Class Full" : "Add to Schedule Cart"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SECURED REGISTRATION RESULTS PIPELINE PANEL */}
            <section style={{ borderTop: '2px solid #f1f5f9', paddingTop: '25px' }}>
              <h3 style={{ fontSize: '1.15rem', margin: '0 0 20px 0', fontWeight: '700', color: '#0f172a' }}>🔒 Your Registered Academic Schedule</h3>
              {enrollments.filter(e => e.username === sessionUser.username).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>Your official semester timetable is currently empty. Complete a checkout workflow from the registration cart matrix sidebar panel.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {enrollments.filter(e => e.username === sessionUser.username).map(course => (
                    <div key={course.courseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px 24px', borderRadius: '10px', borderLeft: '4px solid #10b981', border: '1px solid #e2e8f0' }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: '600' }}>{course.title}</h5>
                        <small style={{ color: '#64748b', fontSize: '0.8rem' }}>{course.courseId.toUpperCase()} • {course.credits} Credits</small>
                      </div>
                      <button onClick={() => handleStudentDropCourse(course.courseId)} style={{ background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 14px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Drop Module</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* FLOATING ACTIONS SIDEBAR BASKET CONTAINER */}
          <aside style={{ background: 'white', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', position: 'sticky', top: '25px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.15rem', fontWeight: '700' }}>🛒 Registration Cart</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>
                <span>Credit Load Metric:</span>
                <strong>{currentCartCredits} / 12 Max</strong>
              </div>
              <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ background: currentCartCredits >= 12 ? '#ef4444' : '#4f46e5', height: '100%', width: `${(currentCartCredits / 12) * 100}%`, transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '120px', marginBottom: '20px' }}>
              {studentCart.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', paddingTop: '35px', fontStyle: 'italic' }}>No records queued inside staging tracks.</p>
              ) : (
                studentCart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }}>{item.title}</span>
                    <button onClick={() => setStudentCart(studentCart.filter(c => c.id !== item.id))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                  </div>
                ))
              )}
            </div>

            <button onClick={handleStudentCheckout} disabled={studentCart.length === 0} style={{ width: '100%', background: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}>Finalize Enrollment</button>
          </aside>

        </div>
      )}

    </div>
  );
}