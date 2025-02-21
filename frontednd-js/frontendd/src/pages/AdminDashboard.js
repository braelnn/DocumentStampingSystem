import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./AdminDashboard.css";
import Header from "../components/Header";
import { getallusers, deleteUser, fetchAllQRCodes } from "../services/authService";
import { getStamps, deleteStamp } from "../services/stampsService";
import { getAllDocuments } from "../services/documentsService";



const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]); // State to hold users
  const [stamps, setStamps] = useState([]);
  const [qrCodes, setQRCodes] = useState([]);
  const [stampedDocs, setStampedDocs] = useState([]);
  const [unstampedDocs, setUnstampedDocs] = useState([]);



  // Fetch all users from backend
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getallusers();
        setUsers(data);
      } catch (error) {
        console.error("Error in AdminDashboard:", error);
      }
    };
  
    const fetchStamps = async () => {
      try {
        const data = await getStamps();
        setStamps(data);
      } catch (error) {
        console.error("Error fetching stamps:", error);
      }
    };

    const getQRCodes = async () => {
        try {
          const data = await fetchAllQRCodes();
          setQRCodes(data);
        } catch (error) {
          console.error("Error fetching QR codes:", error);
        }
      };

      const fetchDocuments = async () => {
        try {
          const data = await getAllDocuments();
          setStampedDocs(data.stamped_documents);
          setUnstampedDocs(data.unstamped_documents);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      };  
      
   
  
    getUsers();
    fetchStamps();
    getQRCodes();
    fetchDocuments();

  }, []);
  

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        alert("Error deleting user. Admin users cannot be deleted.");
      }
    }
  };

  const handleDeleteStamp = async (id) => {
        if (window.confirm("Are you sure you want to delete this stamp?")) {
          try {
            await deleteStamp(id);
            setStamps((prevStamps) => prevStamps.filter((stamp) => stamp.id !== id));
            alert("Stamp deleted successfully.");
          } catch (error) {
            alert("Failed to delete the stamp. Please try again.");
          }
        }
      };
 
  
  // Sample data

  // Sample chart data
  const chartData = {
    labels: ["Users", "Documents", "QR Codes", "Stamps"],
    datasets: [
      {
        label: "Total Count",
        data: [users.length, stampedDocs.length + unstampedDocs.length, qrCodes.length, stamps.length], // ✅ Use stampedDocs + unstampedDocs
        backgroundColor: ["#e74c3c", "#0194e4", "#00ff15", "#ff1ce1"],
      },
    ],
  };
  

  return (
    <div className="adminn">
        <Header />
        <div className="admin-dashboard">
        {/* Sidebar */}
        <aside className={`sidebar1 ${isSidebarOpen ? "open" : "closed"}`}>
            <div className="sidebar-header1">
            {isSidebarOpen && <h2>Welcome, Admin</h2>}
            <button className="toggle-btn1" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? "←" : "→"}
            </button>
            </div>
            <ul>
            <li onClick={() => setSelectedSection("users")}>👤 View Users</li>
            <li onClick={() => setSelectedSection("stamps")}>📜 View Stamps</li>
            <li onClick={() => setSelectedSection("qrCodes")}>📲 View QR Codes</li>
            <li onClick={() => setSelectedSection("documents")}>📂 View Documents</li>
            <li onClick={() => setSelectedSection("charts")}>📊 View Charts</li>
            </ul>
        </aside>

        {/* Right Arrow to Open Sidebar When Collapsed */}
        {!isSidebarOpen && (
            <button className="open-sidebar-btn1" onClick={() => setIsSidebarOpen(true)}>
            →
            </button>
        )}

        {/* Main Content */}
        <main className={`content1 ${isSidebarOpen ? "with-sidebar1" : "without-sidebar1"}`}>
        {selectedSection === "users" && (
            <section>
              <h2>All Users</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Account Type</th>
                    <th>Company</th>
                    <th>Verified</th>
                    <th>Action</th>

                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.account_type}</td>
                      <td>{user.company_name || "N/A"}</td>
                      <td>{user.is_verified === true ? "✅ Yes" : "❌ No"}</td>
                      <td>
                      <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
        )}

        {selectedSection === "stamps" && (
        <section>
            <h2>All Stamps</h2>
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Preview</th>
                <th>Created At</th>
                <th>Action</th>

                </tr>
            </thead>
            <tbody>
                {stamps.map((stamp) => (
                <tr key={stamp.id}>
                    <td>{stamp.id}</td>
                    <td>{stamp.name}</td>
                    <td>
                        <img
                            src={stamp.preview}
                            alt="preview"
                            style={{ width: "300px", height: "300px" }}
                        />
                    </td>
                    <td>{new Date(stamp.created_at).toLocaleDateString()}</td>
                    <td>
                        <button className="delete-btn" onClick={() => handleDeleteStamp(stamp.id)}>Delete</button>
                    </td>

                </tr>
                ))}
            </tbody>
            </table>
        </section>
        )}


        {selectedSection === "qrCodes" && (
        <section>
            <h2>All QR Codes</h2>
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Company</th>
                <th>QR Code</th>
                </tr>
            </thead>
            <tbody>
                {qrCodes.map((qr) => (
                <tr key={qr.id}>
                    <td>{qr.id}</td>
                    <td>{qr.username}</td>
                    <td>{qr.company_name || "N/A"}</td> {/* Display company name */}
                    <td>
                    <img src={qr.qr_code_url} alt="QR Code" style={{ width: "100px" }} />
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </section>
        )}

        
        {selectedSection === "documents" && (
            <section>
                <h2>All Documents</h2>
                <table>
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Stamped</th>
                    </tr>
                </thead>
                <tbody>
                    {stampedDocs.length > 0 || unstampedDocs.length > 0 ? (
                    [...stampedDocs, ...unstampedDocs].map((doc) => (
                        <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>{doc.name}</td>
                        <td>{doc.stamped ? "✅ Yes" : "❌ No"}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="3">No documents found.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </section>
        )}


            

            {selectedSection === "charts" && (
            <section>
                <div className="charts-container">
                <h2>Digital Stamping System Statistics</h2>
                <div className="chart-card">
                    <h3>Data Overview</h3>
                    <Bar data={chartData} />
                </div>
                <div className="chart-card">
                    <h3>Proportions</h3>
                    <Pie data={chartData} />
                </div>
                </div>
          </section>
          
            )}
        </main>
        </div>
        </div>
  );
};

export default AdminDashboard;
