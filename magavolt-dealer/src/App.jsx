
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
  dealer: "",
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
  const [page, setPage] = useState("login");
  const [dealerUser, setDealerUser] = useState(null);
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

  // DEALER LOGIN
  function dealerLogin(e) {
    e.preventDefault();

    const mobile = e.target.mobile.value.trim();
    const email = e.target.email.value.trim().toLowerCase();

    const dealers = JSON.parse(
      localStorage.getItem("magavoltDealers") || "[]"
    );

    const dealer = dealers.find(
      (d) =>
        d.mobile === mobile &&
        d.email.toLowerCase() === email
    );

    if (!dealer) {
      alert("Dealer not found! Please Register.");
      return;
    }

    setDealerUser(dealer);
    setForm({ ...emptyForm, dealer: dealer.name });
    setPage("dashboard");
  }

  // DEALER REGISTRATION
  function dealerRegister(e) {
    e.preventDefault();

    const dealer = {
      name: e.target.name.value.trim(),
      mobile: e.target.mobile.value.trim(),
      email: e.target.email.value.trim().toLowerCase(),
      address: e.target.address.value.trim(),
    };

    if (!/^\d{10}$/.test(dealer.mobile)) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    const dealers = JSON.parse(
      localStorage.getItem("magavoltDealers") || "[]"
    );

    if (dealers.some((d) => d.mobile === dealer.mobile)) {
      alert("Mobile number already registered!");
      return;
    }

    dealers.push(dealer);

    localStorage.setItem(
      "magavoltDealers",
      JSON.stringify(dealers)
    );

    alert("Dealer Registered Successfully!");
    setPage("login");
  }

  // CUSTOMER REGISTRATION
  async function addCustomer(e) {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.mobile)) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    const customer = {
      ...form,
      dealer: dealerUser.name,
      dealerMobile: dealerUser.mobile,
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

      setForm({ ...emptyForm, dealer: dealerUser.name });
      setCreateDate(getDateTime());

      alert("Customer Registered Successfully!");
      setPage("customers");
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Customer Save Failed! Check Firebase.");
    }
  }

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
    setForm({ ...emptyForm, dealer: dealerUser.name });
    setCreateDate(getDateTime());
    setPage("add");
  }

  const myCustomers = customers.filter(
    (c) => c.dealerMobile === dealerUser?.mobile
  );

  const pending = myCustomers.filter(
    (c) => c.status === "PENDING"
  ).length;

  const completed = myCustomers.filter(
    (c) => c.status === "COMPLETED"
  ).length;

  const titles = {
    dashboard: "Dashboard",
    add: "New Customer",
    customers: "My Customers",
    tracking: "Customer Tracking",
    schedule: "Installation Schedule",
  };

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="app">
        <main className="main">
          <div className="content">
            <div className="customerForm">
              <div className="formHeader">
                <h2>⚡ MAGAVOLT</h2>
                <p>Dealer Portal Login</p>
              </div>

              <form onSubmit={dealerLogin}>
                <div className="field">
                  <label>Mobile Number</label>
                  <input
                    name="mobile"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Registered Mobile"
                    required
                  />
                </div>

                <div className="field">
                  <label>Registered Gmail</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Registered Gmail"
                    required
                  />
                </div>

                <button className="primaryBtn" type="submit">
                  LOGIN
                </button>
              </form>

              <p style={{ marginTop: 20 }}>
                New Dealer?
              </p>

              <button
                className="secondaryBtn"
                onClick={() => setPage("register")}
              >
                DEALER REGISTRATION
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // DEALER REGISTRATION PAGE
  if (page === "register") {
    return (
      <div className="app">
        <main className="main">
          <div className="content">
            <form
              className="customerForm"
              onSubmit={dealerRegister}
            >
              <div className="formHeader">
                <h2>Dealer Registration</h2>
                <p>Register your dealership</p>
              </div>

              <div className="field">
                <label>Dealer Name *</label>
                <input name="name" required />
              </div>

              <div className="field">
                <label>Mobile Number *</label>
                <input
                  name="mobile"
                  maxLength={10}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="field">
                <label>Gmail *</label>
                <input name="email" type="email" required />
              </div>

              <div className="field">
                <label>Address *</label>
                <input name="address" required />
              </div>

              <button className="primaryBtn" type="submit">
                REGISTER DEALER
              </button>

              <button
                type="button"
                className="secondaryBtn"
                onClick={() => setPage("login")}
              >
                BACK TO LOGIN
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // MAIN DEALER APP
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h2>⚡ MAGAVOLT</h2>
          <p>DEALER PORTAL</p>
        </div>

        <nav>
          <button onClick={() => setPage("dashboard")}>
            🏠 Dashboard
          </button>
          <button onClick={() => setPage("customers")}>
            👥 My Customers
          </button>
          <button onClick={openNewCustomer}>
            ➕ New Customer
          </button>
          <button onClick={() => setPage("tracking")}>
            🔎 Customer Tracking
          </button>
          <button onClick={() => setPage("schedule")}>
            📅 Installation Schedule
          </button>
        </nav>

        <button
          className="logout"
          onClick={() => {
            setDealerUser(null);
            setPage("login");
          }}
        >
          🚪 Logout
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>MagaVolt Dealer Portal</h2>
            <p>Customer & Installation Management</p>
          </div>
          <span className="dealerBadge">
            Dealer: {dealerUser.name}
          </span>
        </header>

        <div className="content">
          <div className="pageHeading">
            <h1>{titles[page]}</h1>
            <p>Welcome back, {dealerUser.name}</p>
          </div>

          {page === "dashboard" && (
            <>
              <div className="stats">
                <div className="statCard blue">
                  <p>Total Customers</p>
                  <h2>{myCustomers.length}</h2>
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
                </button>

                <button onClick={() => setPage("customers")}>
                  <span className="cardIcon">👥</span>
                  <div>
                    <h3>My Customers</h3>
                    <p>View registered customers</p>
                  </div>
                </button>

                <button onClick={() => setPage("tracking")}>
                  <span className="cardIcon">🔎</span>
                  <div>
                    <h3>Customer Tracking</h3>
                    <p>Track installation status</p>
                  </div>
                </button>

                <button onClick={() => setPage("schedule")}>
                  <span className="cardIcon">📅</span>
                  <div>
                    <h3>Installation Schedule</h3>
                    <p>View installation records</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {page === "add" && (
            <form className="customerForm" onSubmit={addCustomer}>
              <div className="formHeader">
                <h2>New Customer Registration</h2>
              </div>

              <div className="formGrid">
                <div className="field">
                  <label>Create Date</label>
                  <input value={createDate} readOnly />
                </div>

                {[
                  ["name", "Customer Name"],
                  ["mobile", "Mobile Number"],
                  ["alternative", "Alternative Mobile"],
                  ["whatsapp", "WhatsApp Number"],
                  ["email", "Email ID"],
                  ["address", "Full Address"],
                  ["landmark", "Landmark"],
                  ["pin", "PIN Code"],
                  ["city", "City"],
                  ["org", "Org Name"],
                  ["vehicle", "Vehicle Model"],
                ].map(([key, label]) => (
                  <div className="field" key={key}>
                    <label>{label}</label>
                    <input
                      name={key}
                      value={form[key]}
                      onChange={change}
                      required={["name", "mobile", "address", "pin", "city", "vehicle"].includes(key)}
                      maxLength={["mobile", "alternative", "whatsapp"].includes(key) ? 10 : undefined}
                    />
                  </div>
                ))}

                <div className="field">
                  <label>State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={change}
                  />
                </div>

                <div className="field">
                  <label>Dealer Name</label>
                  <input value={dealerUser.name} readOnly />
                </div>

                <div className="field">
                  <label>Charger Capacity</label>
                  <select
                    name="capacity"
                    value={form.capacity}
                    onChange={change}
                  >
                    <option>3.3 kW</option>
                    <option>7.4 kW</option>
                    <option>14 kW</option>
                    <option>22 kW</option>
                  </select>
                </div>
              </div>

              <button className="primaryBtn" type="submit">
                REGISTER CUSTOMER
              </button>
              <button
                type="button"
                className="secondaryBtn"
                onClick={() => setPage("dashboard")}
              >
                BACK TO DASHBOARD
              </button>
            </form>
          )}

          {page === "customers" && (
            <>
              <h2>Total Customers: {myCustomers.length}</h2>
              <button className="primaryBtn" onClick={openNewCustomer}>
                + New Customer
              </button>

              {myCustomers.map((c) => (
                <div
                  className="customerCard"
                  key={c.id}
                  onClick={() => setSelected(c)}
                >
                  <h3>{c.name}</h3>
                  <p>Mobile: {c.mobile}</p>
                  <p>Vehicle: {c.vehicle}</p>
                  <p>Address: {c.address}</p>
                  <p>Create Date: {c.createDate}</p>
                  <span className={`status ${c.status}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </>
          )}

          {page === "tracking" && (
            <div className="trackingBox">
              <h2>Customer Tracking</h2>
              <input
                placeholder="Customer Mobile Number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={10}
              />
              <button className="primaryBtn" onClick={findCustomer}>
                SEARCH CUSTOMER
              </button>
            </div>
          )}

          {page === "schedule" &&
            myCustomers.map((c) => (
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
        </div>

        <footer>© 2026 MAGAVOLT EV TECH PVT. LTD.</footer>
      </main>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Customer Details</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            {Object.entries(selected).map(([key, value]) => (
              <p key={key}>
                <b>{key}:</b> {String(value ?? "-")}
              </p>
            ))}

            <div className="modalStatus">
              Installation Status: {selected.status}
            </div>
            <p className="modalNote">
              Installation status can only be updated from Admin Portal.
            </p>
            <button
              className="primaryBtn"
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
