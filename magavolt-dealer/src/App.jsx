
import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
const emptyForm = {
  name: "",
  mobile: "",
  alternative: "",
  whatsapp: "",
  email: "",
  address: "",
  landmark: "",
  pin: "",
  city: "",
  state: "Assam",
  org: "",
  vehicle: "",
  dealer: "Bharat Motors",
  capacity: "3.3 kW",
};

function getDateTime() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("magavoltCustomers") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [createDate, setCreateDate] = useState(getDateTime());

  useEffect(() => {
    localStorage.setItem(
      "magavoltCustomers",
      JSON.stringify(customers)
    );
  }, [customers]);

  function change(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

   
async function addCustomer(e) {
  e.preventDefault();

  if (!/^\d{10}$/.test(form.mobile)) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  const customer = {
    ...form,
    createDate: getDateTime(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(
      collection(db, "customers"),
      customer
    );

    const savedCustomer = {
      ...customer,
      id: docRef.id,
    };

    setCustomers((previous) => [
      ...previous,
      savedCustomer,
    ]);

    setForm(emptyForm);
    setCreateDate(getDateTime());

    alert("Customer Registered Successfully!");
    setPage("customers");
  } catch (error) {
    console.error("Firebase Error:", error);
    alert("Customer Save Failed! Check Firebase.");
  }
}

   

  const pending = customers.filter(
    (c) => c.status === "PENDING"
  ).length;

  const completed = customers.filter(
    (c) => c.status === "COMPLETED"
  ).length;

  function findCustomer() {
    const number = search.trim();

    const customer = customers.find(
      (c) => c.mobile === number
    );

    if (customer) {
      setSelected(customer);
    } else {
      alert("Customer Not Found");
    }
  }

  function openNewCustomer() {
    setForm(emptyForm);
    setCreateDate(getDateTime());
    setPage("add");
  }

  const titles = {
    dashboard: "Dashboard",
    add: "New Customer",
    customers: "My Customers",
    tracking: "Customer Tracking",
    schedule: "Installation Schedule",
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <h2>⚡ MAGAVOLT</h2>
          <p>DEALER PORTAL</p>
        </div>

        <nav>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className={page === "customers" ? "active" : ""}
            onClick={() => setPage("customers")}
          >
            👥 My Customers
          </button>

          <button
            className={page === "add" ? "active" : ""}
            onClick={openNewCustomer}
          >
            ➕ New Customer
          </button>

          <button
            className={page === "tracking" ? "active" : ""}
            onClick={() => setPage("tracking")}
          >
            🔎 Customer Tracking
          </button>

          <button
            className={page === "schedule" ? "active" : ""}
            onClick={() => setPage("schedule")}
          >
            📅 Installation Schedule
          </button>
        </nav>

        <button
          className="logout"
          onClick={() => {
            if (window.confirm("Logout?")) {
              setPage("dashboard");
            }
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        <header className="topbar">
          <div>
            <h2>MagaVolt Dealer Portal</h2>
            <p>Customer & Installation Management</p>
          </div>
          <span className="dealerBadge">
            Dealer: Bharat Motors
          </span>
        </header>

        <div className="content">

          <div className="pageHeading">
            <h1>{titles[page]}</h1>
            <p>Welcome back, Bharat Motors</p>
          </div>

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              <div className="stats">
                <div className="statCard blue">
                  <p>Total Customers</p>
                  <h2>{customers.length}</h2>
                </div>

                <div className="statCard orange">
                  <p>Pending</p>
                  <h2>{pending}</h2>
                </div>

                <div className="statCard green">
                  <p>Completed</p>
                  <h2>{completed}</h2>
                </div>
              </div>

              <h2 className="sectionTitle">Customer Management</h2>

              <div className="dashboardCards">
                <button onClick={openNewCustomer}>
                  <span className="cardIcon">➕</span>
                  <div>
                    <h3>New Customer</h3>
                    <p>Register a new customer</p>
                  </div>
                  <span className="arrow">›</span>
                </button>

                <button onClick={() => setPage("customers")}>
                  <span className="cardIcon">👥</span>
                  <div>
                    <h3>My Customers</h3>
                    <p>View registered customers</p>
                  </div>
                  <span className="arrow">›</span>
                </button>

                <button onClick={() => setPage("tracking")}>
                  <span className="cardIcon">🔎</span>
                  <div>
                    <h3>Customer Tracking</h3>
                    <p>Track installation status</p>
                  </div>
                  <span className="arrow">›</span>
                </button>

                <button onClick={() => setPage("schedule")}>
                  <span className="cardIcon">📅</span>
                  <div>
                    <h3>Installation Schedule</h3>
                    <p>View installation records</p>
                  </div>
                  <span className="arrow">›</span>
                </button>
              </div>
            </>
          )}

          {/* NEW CUSTOMER */}
          {page === "add" && (
            <form className="customerForm" onSubmit={addCustomer}>
              <div className="formHeader">
                <h2>New Customer Registration</h2>
                <p>Enter customer information below</p>
              </div>

              <div className="formGrid">

                <div className="field">
                  <label>Create Date</label>
                  <input value={createDate} readOnly />
                </div>

                <div className="field">
                  <label>Customer Name *</label>
                  <input
                    name="name"
                    placeholder="Customer Full Name"
                    value={form.name}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>Mobile Number *</label>
                  <input
                    name="mobile"
                    placeholder="10 Digit Mobile Number"
                    value={form.mobile}
                    onChange={change}
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="field">
                  <label>Alternative Mobile</label>
                  <input
                    name="alternative"
                    placeholder="Alternative Mobile"
                    value={form.alternative}
                    onChange={change}
                    maxLength={10}
                  />
                </div>

                <div className="field">
                  <label>WhatsApp Number</label>
                  <input
                    name="whatsapp"
                    placeholder="WhatsApp Number"
                    value={form.whatsapp}
                    onChange={change}
                    maxLength={10}
                  />
                </div>

                <div className="field">
                  <label>Email ID</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email ID"
                    value={form.email}
                    onChange={change}
                  />
                </div>

                <div className="field full">
                  <label>Full Address *</label>
                  <input
                    name="address"
                    placeholder="Village / Town / Address"
                    value={form.address}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>Landmark</label>
                  <input
                    name="landmark"
                    placeholder="Landmark"
                    value={form.landmark}
                    onChange={change}
                  />
                </div>

                <div className="field">
                  <label>PIN Code *</label>
                  <input
                    name="pin"
                    placeholder="6 Digit PIN Code"
                    value={form.pin}
                    onChange={change}
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="field">
                  <label>City *</label>
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>State *</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>Org Name</label>
                  <input
                    name="org"
                    placeholder="Organization Name"
                    value={form.org}
                    onChange={change}
                  />
                </div>

                <div className="field">
                  <label>Vehicle Model *</label>
                  <input
                    name="vehicle"
                    placeholder="Vehicle Model"
                    value={form.vehicle}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>Dealer Name *</label>
                  <input
                    name="dealer"
                    value={form.dealer}
                    onChange={change}
                    required
                  />
                </div>

                <div className="field">
                  <label>Charger Capacity *</label>
                  <select
                    name="capacity"
                    value={form.capacity}
                    onChange={change}
                    required
                  >
                    <option>3.3 kW</option>
                    <option>7.4 kW</option>
                    <option>14 kW</option>
                    <option>22 kW</option>
                  </select>
                </div>

              </div>

              <div className="formActions">
                <button type="submit" className="primaryBtn">
                  REGISTER CUSTOMER
                </button>

                <button
                  type="button"
                  className="secondaryBtn"
                  onClick={() => setPage("dashboard")}
                >
                  BACK TO DASHBOARD
                </button>
              </div>
            </form>
          )}

          {/* MY CUSTOMERS */}
          {page === "customers" && (
            <>
              <div className="listHeader">
                <h2>Total Customers: {customers.length}</h2>
                <button className="primaryBtn" onClick={openNewCustomer}>
                  + New Customer
                </button>
              </div>

              {customers.length === 0 ? (
                <div className="emptyState">
                  No customers registered yet.
                </div>
              ) : (
                <div className="customerList">
                  {customers.map((c) => (
                    <div
                      className="customerCard"
                      key={c.id}
                      onClick={() => setSelected(c)}
                    >
                      <div className="customerCardTop">
                        <h3>{c.name}</h3>
                        <span className={`status ${c.status}`}>
                          {c.status}
                        </span>
                      </div>

                      <p>📱 Mobile: {c.mobile}</p>
                      <p>🚘 Vehicle: {c.vehicle}</p>
                      <p>📍 Address: {c.address}</p>
                      <p>📅 Create Date: {c.createDate}</p>
                      <span className="viewDetails">View Details →</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CUSTOMER TRACKING */}
          {page === "tracking" && (
            <div className="trackingBox">
              <h2>Customer Tracking</h2>
              <p>Search customer using registered mobile number.</p>

              <div className="trackingSearch">
                <input
                  placeholder="Customer Mobile Number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                />

                <button className="primaryBtn" onClick={findCustomer}>
                  SEARCH CUSTOMER
                </button>
              </div>
            </div>
          )}

          {/* INSTALLATION SCHEDULE */}
          {page === "schedule" && (
            <>
              <h2 className="sectionTitle">Installation Records</h2>

              {customers.map((c) => (
                <div className="customerCard" key={c.id}>
                  <h3>{c.name}</h3>
                  <p>Mobile: {c.mobile}</p>
                  <p>Create Date: {c.createDate}</p>
                  <p>Vehicle: {c.vehicle}</p>
                  <span className={`status ${c.status}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </>
          )}

        </div>

        <footer>
          © 2026 MAGAVOLT EV TECH PVT. LTD.
        </footer>
      </main>

      {/* CUSTOMER DETAILS MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div
            className="modalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <h2>Customer Details</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="detailsGrid">
              <p><b>Customer Name:</b> {selected.name}</p>
              <p><b>Mobile Number:</b> {selected.mobile}</p>
              <p><b>Alternative Mobile:</b> {selected.alternative || "-"}</p>
              <p><b>WhatsApp Number:</b> {selected.whatsapp || "-"}</p>
              <p><b>Email ID:</b> {selected.email || "-"}</p>
              <p><b>Full Address:</b> {selected.address}</p>
              <p><b>Landmark:</b> {selected.landmark || "-"}</p>
              <p><b>PIN Code:</b> {selected.pin}</p>
              <p><b>City:</b> {selected.city}</p>
              <p><b>State:</b> {selected.state}</p>
              <p><b>Org Name:</b> {selected.org || "-"}</p>
              <p><b>Vehicle Model:</b> {selected.vehicle}</p>
              <p><b>Dealer Name:</b> {selected.dealer}</p>
              <p><b>Charger Capacity:</b> {selected.capacity}</p>
              <p><b>Create Date:</b> {selected.createDate}</p>
            </div>

            <div className="modalStatus">
              Installation Status: {selected.status}
            </div>

            <p className="modalNote">
              Installation status can only be updated from the Admin Portal.
            </p>

            <button
              className="primaryBtn closeBtn"
              onClick={() => setSelected(null)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
