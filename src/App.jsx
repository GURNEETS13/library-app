import { useState, useEffect } from "react";

// ─── DATA STORE ────────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  users: [
    { id: 1, name: "Admin User", username: "adm", password: "adm", role: "admin", active: true },
    { id: 2, name: "Regular User", username: "user", password: "user", role: "user", active: true },
  ],
  books: [
    { serial: "SC(B)000001", name: "A Brief History of Time", author: "Stephen Hawking", category: "Science", type: "book", status: "available", cost: 450, procDate: "2022-01-15", qty: 3 },
    { serial: "SC(B)000002", name: "The Selfish Gene", author: "Richard Dawkins", category: "Science", type: "book", status: "available", cost: 380, procDate: "2022-03-10", qty: 2 },
    { serial: "EC(B)000001", name: "The Wealth of Nations", author: "Adam Smith", category: "Economics", type: "book", status: "issued", cost: 520, procDate: "2021-06-20", qty: 1 },
    { serial: "FC(B)000001", name: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", type: "book", status: "available", cost: 290, procDate: "2023-02-05", qty: 4 },
    { serial: "FC(B)000002", name: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", type: "book", status: "available", cost: 310, procDate: "2022-11-18", qty: 2 },
    { serial: "CH(B)000001", name: "Charlotte's Web", author: "E.B. White", category: "Children", type: "book", status: "available", cost: 210, procDate: "2023-05-01", qty: 5 },
    { serial: "PD(B)000001", name: "Atomic Habits", author: "James Clear", category: "Personal Development", type: "book", status: "available", cost: 499, procDate: "2023-08-12", qty: 3 },
    { serial: "SC(M)000001", name: "Interstellar", author: "Christopher Nolan", category: "Science", type: "movie", status: "available", cost: 699, procDate: "2022-07-22", qty: 2 },
    { serial: "FC(M)000001", name: "The Shawshank Redemption", author: "Frank Darabont", category: "Fiction", type: "movie", status: "available", cost: 599, procDate: "2021-09-30", qty: 1 },
  ],
  memberships: [
    { id: "MEM001", firstName: "Rohan", lastName: "Verma", contact: "9876543210", address: "12 MG Road, Bangalore", aadhar: "1234-5678-9012", startDate: "2024-01-01", endDate: "2024-12-31", duration: "1year", status: "active", pendingFine: 0 },
    { id: "MEM002", firstName: "Priya", lastName: "Sharma", contact: "9123456780", address: "45 Linking Road, Mumbai", aadhar: "9876-5432-1098", startDate: "2024-03-15", endDate: "2024-09-15", duration: "6months", status: "active", pendingFine: 50 },
    { id: "MEM003", firstName: "Amit", lastName: "Patel", contact: "9012345678", address: "78 CG Road, Ahmedabad", aadhar: "1111-2222-3333", startDate: "2023-06-01", endDate: "2025-05-31", duration: "2years", status: "active", pendingFine: 0 },
  ],
  issues: [
    { id: "ISS001", serialNo: "EC(B)000001", bookName: "The Wealth of Nations", membershipId: "MEM001", issueDate: "2024-04-01", returnDate: "2024-04-16", actualReturn: null, fine: 0, status: "active" },
  ],
  issueRequests: [
    { id: "REQ001", membershipId: "MEM002", bookName: "Atomic Habits", requestedDate: "2024-04-10", fulfilledDate: null },
  ],
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split("T")[0]; };
const calcFine = (returnDate, actual) => {
  const due = new Date(returnDate), ret = new Date(actual || today());
  const diff = Math.ceil((ret - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff * 5 : 0;
};

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    book: "📚", movie: "🎬", member: "👤", chart: "📊", home: "🏠", logout: "🚪",
    back: "←", add: "➕", edit: "✏️", search: "🔍", check: "✅", warn: "⚠️",
    fine: "💰", issue: "📤", return: "📥", maintenance: "⚙️", report: "📋",
    transaction: "🔄", lock: "🔒", user: "👥", cancel: "✖", confirm: "✔",
    active: "🟢", inactive: "🔴", overdue: "🕐",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "•"}</span>;
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "#0f1117", color: "#e8e8e8", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column" },
  topBar: { background: "linear-gradient(135deg, #1a1f2e 0%, #0f1117 100%)", borderBottom: "1px solid #2a3352", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 20, fontWeight: "bold", color: "#c9a84c", letterSpacing: 1 },
  topMeta: { fontSize: 12, color: "#8892a4", display: "flex", gap: 16, alignItems: "center" },
  badge: (role) => ({ background: role === "admin" ? "#2a1f0a" : "#0a1f2a", color: role === "admin" ? "#c9a84c" : "#4ca8c9", border: `1px solid ${role === "admin" ? "#c9a84c44" : "#4ca8c944"}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }),
  main: { display: "flex", flex: 1 },
  sidebar: { width: 200, background: "#13182a", borderRight: "1px solid #1e2740", padding: "16px 0", flexShrink: 0 },
  sideGroup: { marginBottom: 8 },
  sideGroupLabel: { fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: 2, padding: "4px 16px 6px" },
  sideItem: (active) => ({ display: "block", padding: "8px 16px", fontSize: 13, color: active ? "#c9a84c" : "#8892a4", background: active ? "#1e2740" : "transparent", borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s", width: "100%", textAlign: "left", border: "none", borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent", fontFamily: "inherit" }),
  content: { flex: 1, padding: 24, overflowY: "auto" },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#c9a84c", marginBottom: 4, borderBottom: "1px solid #2a3352", paddingBottom: 10, marginBottom: 16 },
  card: { background: "#13182a", border: "1px solid #1e2740", borderRadius: 8, padding: 20, marginBottom: 16 },
  label: { fontSize: 12, color: "#8892a4", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { background: "#0f1117", border: "1px solid #2a3352", borderRadius: 6, color: "#e8e8e8", padding: "8px 12px", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit", transition: "border 0.15s" },
  select: { background: "#0f1117", border: "1px solid #2a3352", borderRadius: 6, color: "#e8e8e8", padding: "8px 12px", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" },
  btnPrimary: { background: "linear-gradient(135deg, #c9a84c, #a8832e)", color: "#0f1117", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" },
  btnSecondary: { background: "transparent", color: "#8892a4", border: "1px solid #2a3352", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnDanger: { background: "#2a0f0f", color: "#e84c4c", border: "1px solid #4c1a1a", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "#1e2740", color: "#c9a84c", padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #2a3352" },
  td: { padding: "10px 12px", borderBottom: "1px solid #1a2030", color: "#c8cdd6" },
  trHover: { background: "#161c2e" },
  error: { background: "#2a0f0f", border: "1px solid #4c1a1a", color: "#e84c4c", borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 13 },
  success: { background: "#0a2a0f", border: "1px solid #1a4c1a", color: "#4ce84c", borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 13 },
  info: { background: "#0a1f2a", border: "1px solid #1a3a4c", color: "#4ca8c9", borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 13 },
  statusChip: (s) => {
    const map = { available: ["#0a2a0f", "#4ce84c"], issued: ["#2a1f0a", "#c9a84c"], "inactive": ["#2a0f0f", "#e84c4c"], active: ["#0a2a0f", "#4ce84c"] };
    const [bg, color] = map[s] || ["#1e2740", "#8892a4"];
    return { background: bg, color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, display: "inline-block" };
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  formGroup: { marginBottom: 14 },
  radioGroup: { display: "flex", gap: 16, marginTop: 4 },
  radioLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#c8cdd6", cursor: "pointer" },
  loginWrap: { minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" },
  loginBox: { background: "#13182a", border: "1px solid #2a3352", borderRadius: 12, padding: "40px 36px", width: 360 },
  loginTitle: { fontSize: 26, fontWeight: "bold", color: "#c9a84c", textAlign: "center", marginBottom: 4 },
  loginSub: { fontSize: 13, color: "#4a5568", textAlign: "center", marginBottom: 28 },
  logoutBtn: { background: "transparent", border: "1px solid #2a3352", color: "#8892a4", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
};

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage({ users, onLogin }) {
  const [uid, setUid] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const u = users.find(x => x.username === uid && x.password === pwd && x.active);
    if (!u) { setErr("Invalid credentials or inactive account."); return; }
    onLogin(u);
  };

  return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <div style={S.loginTitle}>📚 Book Palace</div>
        <div style={S.loginSub}>Library Management System</div>
        {err && <div style={S.error}>{err}</div>}
        <div style={S.formGroup}>
          <label style={S.label}>User ID</label>
          <input style={S.input} value={uid} onChange={e => { setUid(e.target.value); setErr(""); }} placeholder="Enter user ID" />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={pwd} onChange={e => { setPwd(e.target.value); setErr(""); }} placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button style={{ ...S.btnPrimary, width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }} onClick={handleLogin}>Login</button>
        <div style={{ marginTop: 20, fontSize: 11, color: "#4a5568", textAlign: "center" }}>
          Admin: adm/adm &nbsp;|&nbsp; User: user/user
        </div>
      </div>
    </div>
  );
}

// ─── TABLE ─────────────────────────────────────────────────────────────────────
function Table({ cols, rows, noDataMsg = "No records found." }) {
  const [hov, setHov] = useState(null);
  if (!rows.length) return <div style={{ ...S.info, textAlign: "center" }}>{noDataMsg}</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={S.table}>
        <thead><tr>{cols.map(c => <th key={c.key} style={S.th}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={hov === i ? S.trHover : {}} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              {cols.map(c => <td key={c.key} style={S.td}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TRANSACTIONS ──────────────────────────────────────────────────────────────
function BookAvailable({ data }) {
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    if (!name && !author) return;
    const res = data.books.filter(b =>
      (!name || b.name.toLowerCase().includes(name.toLowerCase())) &&
      (!author || b.author.toLowerCase().includes(author.toLowerCase()))
    );
    setResults(res);
  };

  return (
    <div>
      <div style={S.pageTitle}>Book Availability</div>
      <div style={S.card}>
        <div style={S.row2}>
          <div style={S.formGroup}>
            <label style={S.label}>Enter Book Name</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="Search by title..." />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Enter Author</label>
            <input style={S.input} value={author} onChange={e => setAuthor(e.target.value)} placeholder="Search by author..." />
          </div>
        </div>
        {!name && !author && <div style={{ ...S.error, marginBottom: 0 }}>Please enter at least one search term (Book Name or Author).</div>}
        <button style={S.btnPrimary} onClick={handleSearch}><Icon name="search" /> Search</button>
      </div>
      {results !== null && (
        <div style={S.card}>
          <Table
            cols={[
              { key: "name", label: "Book Name" },
              { key: "author", label: "Author" },
              { key: "serial", label: "Serial No" },
              { key: "status", label: "Available", render: r => <span style={S.statusChip(r.status)}>{r.status === "available" ? "Yes" : "No"}</span> },
            ]}
            rows={results}
            noDataMsg="No books found matching your search."
          />
        </div>
      )}
    </div>
  );
}

function IssueBook({ data, setData, onDone }) {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [memberId, setMemberId] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [returnDate, setReturnDate] = useState(addDays(today(), 15));
  const [remarks, setRemarks] = useState("");
  const [err, setErr] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const avail = data.books.filter(b => b.name.toLowerCase().includes(bookName.toLowerCase()) && b.status === "available");

  const handleSelectBook = (b) => {
    setSelectedBook(b);
    setBookName(b.name);
    setAuthor(b.author);
  };

  const handleSubmit = () => {
    if (!selectedBook) { setErr("Please select a book from search results."); return; }
    if (!memberId) { setErr("Membership ID is required."); return; }
    const mem = data.memberships.find(m => m.id === memberId && m.status === "active");
    if (!mem) { setErr("No active membership found with this ID."); return; }
    if (issueDate < today()) { setErr("Issue date cannot be in the past."); return; }
    const rd = new Date(returnDate), id = new Date(issueDate);
    const diff = (rd - id) / (1000 * 60 * 60 * 24);
    if (diff > 15) { setErr("Return date cannot be more than 15 days from issue date."); return; }
    if (diff < 1) { setErr("Return date must be after issue date."); return; }

    const newIssue = { id: `ISS${Date.now()}`, serialNo: selectedBook.serial, bookName: selectedBook.name, membershipId: memberId, issueDate, returnDate, actualReturn: null, fine: 0, status: "active" };
    const updBooks = data.books.map(b => b.serial === selectedBook.serial ? { ...b, status: "issued" } : b);
    setData({ ...data, books: updBooks, issues: [...data.issues, newIssue] });
    onDone("Book issued successfully!");
  };

  return (
    <div>
      <div style={S.pageTitle}>Book Issue</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        <div style={S.row2}>
          <div style={S.formGroup}>
            <label style={S.label}>Book Name *</label>
            <input style={S.input} value={bookName} onChange={e => { setBookName(e.target.value); setSelectedBook(null); setErr(""); }} placeholder="Type to search..." />
            {bookName && !selectedBook && avail.length > 0 && (
              <div style={{ background: "#0f1117", border: "1px solid #2a3352", borderRadius: 6, marginTop: 4 }}>
                {avail.map(b => <div key={b.serial} onClick={() => handleSelectBook(b)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#c8cdd6", borderBottom: "1px solid #1a2030" }}>{b.name} — {b.author}</div>)}
              </div>
            )}
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Author (auto-populated)</label>
            <input style={{ ...S.input, color: "#4a5568" }} value={author} readOnly placeholder="Select book above" />
          </div>
        </div>
        <div style={S.row3}>
          <div style={S.formGroup}>
            <label style={S.label}>Membership ID *</label>
            <input style={S.input} value={memberId} onChange={e => { setMemberId(e.target.value); setErr(""); }} placeholder="e.g. MEM001" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Issue Date *</label>
            <input style={S.input} type="date" value={issueDate} min={today()} onChange={e => { setIssueDate(e.target.value); setReturnDate(addDays(e.target.value, 15)); }} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Return Date * (max 15 days)</label>
            <input style={S.input} type="date" value={returnDate} min={addDays(issueDate, 1)} max={addDays(issueDate, 15)} onChange={e => setReturnDate(e.target.value)} />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Remarks (optional)</label>
          <textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>
        <button style={S.btnPrimary} onClick={handleSubmit}>Issue Book</button>
      </div>
    </div>
  );
}

function ReturnBook({ data, setData, onDone, onConfirm }) {
  const [bookName, setBookName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [returnDate, setReturnDate] = useState(today());
  const [remarks, setRemarks] = useState("");
  const [err, setErr] = useState("");
  const [issue, setIssue] = useState(null);

  const handleBookSelect = (b) => {
    setBookName(b);
    const iss = data.issues.find(i => i.bookName.toLowerCase().includes(b.toLowerCase()) && i.status === "active");
    if (iss) { setIssue(iss); setSerialNo(iss.serialNo); }
  };

  const activeIssues = data.issues.filter(i => i.status === "active");

  const handleSubmit = () => {
    if (!bookName) { setErr("Book name is required."); return; }
    if (!serialNo) { setErr("Serial No is required."); return; }
    if (!issue) { setErr("No active issue found for this book/serial."); return; }
    onConfirm({ issue, returnDate, remarks });
  };

  return (
    <div>
      <div style={S.pageTitle}>Return Book</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        <div style={S.row2}>
          <div style={S.formGroup}>
            <label style={S.label}>Book Name *</label>
            <select style={S.select} value={bookName} onChange={e => { handleBookSelect(e.target.value); setErr(""); }}>
              <option value="">-- Select Book --</option>
              {activeIssues.map(i => <option key={i.id} value={i.bookName}>{i.bookName}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Author (auto-populated)</label>
            <input style={{ ...S.input, color: "#4a5568" }} value={issue ? data.books.find(b => b.serial === issue.serialNo)?.author || "" : ""} readOnly />
          </div>
        </div>
        <div style={S.row3}>
          <div style={S.formGroup}>
            <label style={S.label}>Serial No *</label>
            <input style={{ ...S.input, color: "#4a5568" }} value={serialNo} readOnly placeholder="Auto-filled on book select" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Issue Date (auto-populated)</label>
            <input style={{ ...S.input, color: "#4a5568" }} value={issue?.issueDate || ""} readOnly />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Return Date</label>
            <input style={S.input} type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Remarks (optional)</label>
          <textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>
        <button style={S.btnPrimary} onClick={handleSubmit}>Confirm Return</button>
      </div>
    </div>
  );
}

function PayFine({ data, setData, issue, returnDate, onDone }) {
  const [finePaid, setFinePaid] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [err, setErr] = useState("");

  const fine = calcFine(issue.returnDate, returnDate);
  const book = data.books.find(b => b.serial === issue.serialNo);

  const handleConfirm = () => {
    if (fine > 0 && !finePaid) { setErr("Fine must be paid before completing the return."); return; }
    const updIssues = data.issues.map(i => i.id === issue.id ? { ...i, actualReturn: returnDate, fine, status: "returned" } : i);
    const updBooks = data.books.map(b => b.serial === issue.serialNo ? { ...b, status: "available" } : b);
    setData({ ...data, issues: updIssues, books: updBooks });
    onDone("Book returned successfully!");
  };

  return (
    <div>
      <div style={S.pageTitle}>Pay Fine</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {fine > 0 && <div style={S.warn}>⚠️ Overdue fine of ₹{fine} calculated. Please collect before confirming.</div>}
        {fine === 0 && <div style={S.success}>No fine applicable. You may confirm the return.</div>}
        <div style={S.row3}>
          <div style={S.formGroup}><label style={S.label}>Book Name</label><input style={{ ...S.input, color: "#4a5568" }} value={issue.bookName} readOnly /></div>
          <div style={S.formGroup}><label style={S.label}>Author</label><input style={{ ...S.input, color: "#4a5568" }} value={book?.author || ""} readOnly /></div>
          <div style={S.formGroup}><label style={S.label}>Serial No</label><input style={{ ...S.input, color: "#4a5568" }} value={issue.serialNo} readOnly /></div>
        </div>
        <div style={S.row3}>
          <div style={S.formGroup}><label style={S.label}>Issue Date</label><input style={{ ...S.input, color: "#4a5568" }} value={issue.issueDate} readOnly /></div>
          <div style={S.formGroup}><label style={S.label}>Due Return Date</label><input style={{ ...S.input, color: "#4a5568" }} value={issue.returnDate} readOnly /></div>
          <div style={S.formGroup}><label style={S.label}>Actual Return Date</label><input style={{ ...S.input, color: "#4a5568" }} value={returnDate} readOnly /></div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>Fine Calculated (₹)</label><input style={{ ...S.input, color: fine > 0 ? "#e84c4c" : "#4ce84c" }} value={fine} readOnly /></div>
          <div style={S.formGroup}>
            <label style={S.label}>Fine Paid</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <input type="checkbox" checked={finePaid} onChange={e => { setFinePaid(e.target.checked); setErr(""); }} id="finePaidCb" style={{ width: 16, height: 16 }} />
              <label htmlFor="finePaidCb" style={{ fontSize: 13, color: "#c8cdd6", cursor: "pointer" }}>Mark as Paid</label>
            </div>
          </div>
        </div>
        <div style={S.formGroup}><label style={S.label}>Remarks (optional)</label><textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
        <button style={S.btnPrimary} onClick={handleConfirm}>Complete Return</button>
      </div>
    </div>
  );
}

function Transactions({ data, setData }) {
  const [tab, setTab] = useState("available");
  const [returnCtx, setReturnCtx] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDone = (msg) => { setSuccessMsg(msg); setReturnCtx(null); setTimeout(() => setSuccessMsg(""), 3000); };
  const handleReturnConfirm = (ctx) => { setReturnCtx(ctx); setTab("payfine"); };

  const tabs = [
    { key: "available", label: "Is Book Available?" },
    { key: "issue", label: "Issue Book" },
    { key: "return", label: "Return Book" },
    { key: "payfine", label: "Pay Fine" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => <button key={t.key} style={{ ...S.sideItem(tab === t.key), border: "1px solid #2a3352", borderRadius: 6, marginRight: 4 }} onClick={() => { setTab(t.key); setSuccessMsg(""); }}>{t.label}</button>)}
      </div>
      {successMsg && <div style={S.success}>{successMsg}</div>}
      {tab === "available" && <BookAvailable data={data} />}
      {tab === "issue" && <IssueBook data={data} setData={setData} onDone={handleDone} />}
      {tab === "return" && !returnCtx && <ReturnBook data={data} setData={setData} onDone={handleDone} onConfirm={handleReturnConfirm} />}
      {tab === "payfine" && returnCtx && <PayFine data={data} setData={setData} issue={returnCtx.issue} returnDate={returnCtx.returnDate} onDone={handleDone} />}
      {tab === "payfine" && !returnCtx && <div style={S.info}>Please go to <b>Return Book</b> first to initiate a return, then you'll be directed here to process the fine.</div>}
    </div>
  );
}

// ─── REPORTS ───────────────────────────────────────────────────────────────────
function Reports({ data }) {
  const [tab, setTab] = useState("books");
  const tabs = [
    { key: "books", label: "Master List of Books" },
    { key: "movies", label: "Master List of Movies" },
    { key: "memberships", label: "Master List of Memberships" },
    { key: "active", label: "Active Issues" },
    { key: "overdue", label: "Overdue Returns" },
    { key: "requests", label: "Issue Requests" },
  ];

  const overdueIssues = data.issues.filter(i => i.status === "active" && new Date(i.returnDate) < new Date());

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => <button key={t.key} style={{ ...S.sideItem(tab === t.key), border: "1px solid #2a3352", borderRadius: 6, marginRight: 4, marginBottom: 4 }} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      {tab === "books" && <>
        <div style={S.pageTitle}>Master List of Books</div>
        <Table cols={[{ key: "serial", label: "Serial No" }, { key: "name", label: "Name of Book" }, { key: "author", label: "Author" }, { key: "category", label: "Category" }, { key: "status", label: "Status", render: r => <span style={S.statusChip(r.status)}>{r.status}</span> }, { key: "cost", label: "Cost (₹)" }, { key: "procDate", label: "Procurement Date" }]}
          rows={data.books.filter(b => b.type === "book")} />
      </>}
      {tab === "movies" && <>
        <div style={S.pageTitle}>Master List of Movies</div>
        <Table cols={[{ key: "serial", label: "Serial No" }, { key: "name", label: "Name of Movie" }, { key: "author", label: "Director" }, { key: "category", label: "Category" }, { key: "status", label: "Status", render: r => <span style={S.statusChip(r.status)}>{r.status}</span> }, { key: "cost", label: "Cost (₹)" }, { key: "procDate", label: "Procurement Date" }]}
          rows={data.books.filter(b => b.type === "movie")} />
      </>}
      {tab === "memberships" && <>
        <div style={S.pageTitle}>Master List of Memberships</div>
        <Table cols={[{ key: "id", label: "Membership ID" }, { key: "name", label: "Name", render: r => `${r.firstName} ${r.lastName}` }, { key: "contact", label: "Contact" }, { key: "address", label: "Address" }, { key: "aadhar", label: "Aadhar" }, { key: "startDate", label: "Start Date" }, { key: "endDate", label: "End Date" }, { key: "status", label: "Status", render: r => <span style={S.statusChip(r.status)}>{r.status}</span> }, { key: "pendingFine", label: "Pending Fine (₹)" }]}
          rows={data.memberships} />
      </>}
      {tab === "active" && <>
        <div style={S.pageTitle}>Active Issues</div>
        <Table cols={[{ key: "serialNo", label: "Serial No" }, { key: "bookName", label: "Book/Movie" }, { key: "membershipId", label: "Membership ID" }, { key: "issueDate", label: "Issue Date" }, { key: "returnDate", label: "Due Return Date" }]}
          rows={data.issues.filter(i => i.status === "active")} />
      </>}
      {tab === "overdue" && <>
        <div style={S.pageTitle}>Overdue Returns</div>
        <Table cols={[{ key: "serialNo", label: "Serial No" }, { key: "bookName", label: "Book" }, { key: "membershipId", label: "Membership ID" }, { key: "issueDate", label: "Issue Date" }, { key: "returnDate", label: "Due Return" }, { key: "fine", label: "Fine (₹)", render: r => <span style={{ color: "#e84c4c" }}>₹{calcFine(r.returnDate, today())}</span> }]}
          rows={overdueIssues} noDataMsg="No overdue returns! 🎉" />
      </>}
      {tab === "requests" && <>
        <div style={S.pageTitle}>Issue Requests</div>
        <Table cols={[{ key: "id", label: "Request ID" }, { key: "membershipId", label: "Membership ID" }, { key: "bookName", label: "Book/Movie" }, { key: "requestedDate", label: "Requested Date" }, { key: "fulfilledDate", label: "Fulfilled Date", render: r => r.fulfilledDate || <span style={{ color: "#8892a4" }}>Pending</span> }]}
          rows={data.issueRequests} />
      </>}
    </div>
  );
}

// ─── MAINTENANCE ──────────────────────────────────────────────────────────────
function AddMembership({ data, setData }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", contact: "", address: "", aadhar: "", startDate: today(), endDate: addDays(today(), 180), duration: "6months" });
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");

  const durationMap = { "6months": 180, "1year": 365, "2years": 730 };
  const setF = (k, v) => {
    const upd = { ...form, [k]: v };
    if (k === "duration" || k === "startDate") upd.endDate = addDays(upd.startDate, durationMap[upd.duration]);
    setForm(upd);
  };

  const handleSubmit = () => {
    const { firstName, lastName, contact, address, aadhar } = form;
    if (!firstName || !lastName || !contact || !address || !aadhar) { setErr("All fields are required."); return; }
    const newMem = { ...form, id: `MEM${String(data.memberships.length + 1).padStart(3, "0")}`, status: "active", pendingFine: 0 };
    setData({ ...data, memberships: [...data.memberships, newMem] });
    setOk(`Membership ${newMem.id} created for ${firstName} ${lastName}.`);
    setForm({ firstName: "", lastName: "", contact: "", address: "", aadhar: "", startDate: today(), endDate: addDays(today(), 180), duration: "6months" });
    setErr("");
  };

  return (
    <div>
      <div style={S.pageTitle}>Add Membership</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {ok && <div style={S.success}>{ok}</div>}
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>First Name *</label><input style={S.input} value={form.firstName} onChange={e => setF("firstName", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>Last Name *</label><input style={S.input} value={form.lastName} onChange={e => setF("lastName", e.target.value)} /></div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>Contact Number *</label><input style={S.input} value={form.contact} onChange={e => setF("contact", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>Aadhar Card No *</label><input style={S.input} value={form.aadhar} onChange={e => setF("aadhar", e.target.value)} /></div>
        </div>
        <div style={S.formGroup}><label style={S.label}>Contact Address *</label><textarea style={{ ...S.input, height: 56 }} value={form.address} onChange={e => setF("address", e.target.value)} /></div>
        <div style={S.formGroup}>
          <label style={S.label}>Membership Duration *</label>
          <div style={S.radioGroup}>
            {["6months", "1year", "2years"].map(d => (
              <label key={d} style={S.radioLabel}>
                <input type="radio" name="duration" value={d} checked={form.duration === d} onChange={() => setF("duration", d)} />
                {d === "6months" ? "6 Months" : d === "1year" ? "1 Year" : "2 Years"}
              </label>
            ))}
          </div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>Start Date</label><input style={S.input} type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>End Date (auto)</label><input style={{ ...S.input, color: "#4a5568" }} value={form.endDate} readOnly /></div>
        </div>
        <button style={S.btnPrimary} onClick={handleSubmit}>Add Membership</button>
      </div>
    </div>
  );
}

function UpdateMembership({ data, setData }) {
  const [memId, setMemId] = useState(""); const [mem, setMem] = useState(null);
  const [extn, setExtn] = useState("6months"); const [remove, setRemove] = useState(false);
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const durationMap = { "6months": 180, "1year": 365, "2years": 730 };

  const handleSearch = () => {
    const m = data.memberships.find(x => x.id === memId);
    if (!m) { setErr("No membership found with this ID."); setMem(null); return; }
    setMem(m); setErr("");
  };

  const handleUpdate = () => {
    if (remove) {
      const upd = data.memberships.map(m => m.id === memId ? { ...m, status: "inactive" } : m);
      setData({ ...data, memberships: upd }); setOk("Membership cancelled."); setMem(null); return;
    }
    const upd = data.memberships.map(m => {
      if (m.id !== memId) return m;
      const newEnd = addDays(m.endDate, durationMap[extn]);
      return { ...m, endDate: newEnd };
    });
    setData({ ...data, memberships: upd }); setOk(`Membership extended by ${extn}.`); setMem(null);
  };

  return (
    <div>
      <div style={S.pageTitle}>Update Membership</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {ok && <div style={S.success}>{ok}</div>}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input style={{ ...S.input, flex: 1 }} value={memId} onChange={e => { setMemId(e.target.value); setErr(""); setOk(""); }} placeholder="Enter Membership ID (e.g. MEM001)" />
          <button style={S.btnPrimary} onClick={handleSearch}>Search</button>
        </div>
        {mem && <div style={{ ...S.card, background: "#0f1117" }}>
          <div style={S.row2}>
            <div><label style={S.label}>Name</label><div style={{ color: "#c8cdd6" }}>{mem.firstName} {mem.lastName}</div></div>
            <div><label style={S.label}>Status</label><span style={S.statusChip(mem.status)}>{mem.status}</span></div>
            <div><label style={S.label}>Start</label><div style={{ color: "#c8cdd6" }}>{mem.startDate}</div></div>
            <div><label style={S.label}>End</label><div style={{ color: "#c8cdd6" }}>{mem.endDate}</div></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={S.label}>Extend Membership By</label>
            <div style={S.radioGroup}>
              {["6months", "1year", "2years"].map(d => (
                <label key={d} style={S.radioLabel}><input type="radio" name="extn" value={d} checked={extn === d} disabled={remove} onChange={() => setExtn(d)} />{d === "6months" ? "6 Months" : d === "1year" ? "1 Year" : "2 Years"}</label>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={S.radioLabel}><input type="radio" name="action" checked={remove} onChange={() => setRemove(!remove)} /> Cancel Membership</label>
          </div>
          <button style={{ ...S.btnPrimary, marginTop: 14 }} onClick={handleUpdate}>Update</button>
        </div>}
      </div>
    </div>
  );
}

function AddBook({ data, setData }) {
  const [type, setType] = useState("book");
  const [form, setForm] = useState({ name: "", author: "", category: "Science", cost: "", procDate: today(), qty: 1 });
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");

  const cats = ["Science", "Economics", "Fiction", "Children", "Personal Development"];
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    const { name, author, cost, procDate, qty } = form;
    if (!name || !author || !cost || !procDate) { setErr("All fields are required."); return; }
    const prefix = form.category.slice(0, 2).toUpperCase();
    const typeChar = type === "book" ? "B" : "M";
    const count = data.books.filter(b => b.category === form.category && b.type === type).length + 1;
    const serial = `${prefix}(${typeChar})${String(count).padStart(6, "0")}`;
    const newBook = { ...form, serial, type, status: "available", cost: Number(cost), qty: Number(qty) };
    setData({ ...data, books: [...data.books, newBook] });
    setOk(`${type === "book" ? "Book" : "Movie"} "${name}" added with serial ${serial}.`);
    setForm({ name: "", author: "", category: "Science", cost: "", procDate: today(), qty: 1 });
    setErr("");
  };

  return (
    <div>
      <div style={S.pageTitle}>Add Book / Movie</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {ok && <div style={S.success}>{ok}</div>}
        <div style={S.formGroup}>
          <label style={S.label}>Type *</label>
          <div style={S.radioGroup}>
            <label style={S.radioLabel}><input type="radio" name="type" value="book" checked={type === "book"} onChange={() => setType("book")} /> Book</label>
            <label style={S.radioLabel}><input type="radio" name="type" value="movie" checked={type === "movie"} onChange={() => setType("movie")} /> Movie</label>
          </div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>{type === "book" ? "Book" : "Movie"} Name *</label><input style={S.input} value={form.name} onChange={e => setF("name", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>{type === "book" ? "Author" : "Director"} *</label><input style={S.input} value={form.author} onChange={e => setF("author", e.target.value)} /></div>
        </div>
        <div style={S.row3}>
          <div style={S.formGroup}><label style={S.label}>Category *</label><select style={S.select} value={form.category} onChange={e => setF("category", e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
          <div style={S.formGroup}><label style={S.label}>Cost (₹) *</label><input style={S.input} type="number" value={form.cost} onChange={e => setF("cost", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>Quantity/Copies *</label><input style={S.input} type="number" value={form.qty} min={1} onChange={e => setF("qty", e.target.value)} /></div>
        </div>
        <div style={S.formGroup}><label style={S.label}>Date of Procurement *</label><input style={S.input} type="date" value={form.procDate} onChange={e => setF("procDate", e.target.value)} /></div>
        <button style={S.btnPrimary} onClick={handleSubmit}>Add {type === "book" ? "Book" : "Movie"}</button>
      </div>
    </div>
  );
}

function UpdateBook({ data, setData }) {
  const [type, setType] = useState("book");
  const [name, setName] = useState(""); const [serialNo, setSerialNo] = useState("");
  const [status, setStatus] = useState("available"); const [date, setDate] = useState(today());
  const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [book, setBook] = useState(null);

  const filtered = data.books.filter(b => b.type === type && b.name.toLowerCase().includes(name.toLowerCase()));

  const handleSelect = (b) => { setBook(b); setName(b.name); setSerialNo(b.serial); setStatus(b.status); };

  const handleUpdate = () => {
    if (!book) { setErr("Please select a book/movie."); return; }
    const upd = data.books.map(b => b.serial === book.serial ? { ...b, status, serial: serialNo } : b);
    setData({ ...data, books: upd }); setOk(`"${book.name}" updated successfully.`); setBook(null); setName(""); setErr("");
  };

  return (
    <div>
      <div style={S.pageTitle}>Update Book / Movie</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {ok && <div style={S.success}>{ok}</div>}
        <div style={S.formGroup}>
          <label style={S.label}>Type *</label>
          <div style={S.radioGroup}>
            <label style={S.radioLabel}><input type="radio" name="utype" value="book" checked={type === "book"} onChange={() => { setType("book"); setBook(null); }} /> Book</label>
            <label style={S.radioLabel}><input type="radio" name="utype" value="movie" checked={type === "movie"} onChange={() => { setType("movie"); setBook(null); }} /> Movie</label>
          </div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}>
            <label style={S.label}>Book/Movie Name *</label>
            <input style={S.input} value={name} onChange={e => { setName(e.target.value); setBook(null); }} placeholder="Type to search..." />
            {name && !book && filtered.length > 0 && (
              <div style={{ background: "#0f1117", border: "1px solid #2a3352", borderRadius: 6, marginTop: 4 }}>
                {filtered.map(b => <div key={b.serial} onClick={() => handleSelect(b)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#c8cdd6", borderBottom: "1px solid #1a2030" }}>{b.name} ({b.serial})</div>)}
              </div>
            )}
          </div>
          <div style={S.formGroup}><label style={S.label}>Serial No</label><input style={{ ...S.input, color: "#4a5568" }} value={serialNo} readOnly /></div>
        </div>
        <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>Status</label><select style={S.select} value={status} onChange={e => setStatus(e.target.value)}><option value="available">Available</option><option value="issued">Issued</option><option value="damaged">Damaged</option><option value="lost">Lost</option></select></div>
          <div style={S.formGroup}><label style={S.label}>Date</label><input style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <button style={S.btnPrimary} onClick={handleUpdate}>Update</button>
      </div>
    </div>
  );
}

function UserManagement({ data, setData }) {
  const [mode, setMode] = useState("new");
  const [form, setForm] = useState({ name: "", username: "", password: "", active: true, admin: false });
  const [searchName, setSearchName] = useState(""); const [selUser, setSelUser] = useState(null);
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.name) { setErr("Name is required."); return; }
    if (mode === "new") {
      if (!form.username || !form.password) { setErr("Username and password required for new users."); return; }
      const newUser = { id: Date.now(), name: form.name, username: form.username, password: form.password, role: form.admin ? "admin" : "user", active: form.active };
      setData({ ...data, users: [...data.users, newUser] });
      setOk(`User "${form.name}" created.`);
    } else {
      if (!selUser) { setErr("Please select an existing user."); return; }
      const upd = data.users.map(u => u.id === selUser.id ? { ...u, name: form.name, active: form.active, role: form.admin ? "admin" : "user" } : u);
      setData({ ...data, users: upd }); setOk(`User "${form.name}" updated.`);
    }
    setForm({ name: "", username: "", password: "", active: true, admin: false }); setSelUser(null); setErr("");
  };

  const filtered = data.users.filter(u => u.name.toLowerCase().includes(searchName.toLowerCase()));

  return (
    <div>
      <div style={S.pageTitle}>User Management</div>
      <div style={S.card}>
        {err && <div style={S.error}>{err}</div>}
        {ok && <div style={S.success}>{ok}</div>}
        <div style={S.formGroup}>
          <label style={S.label}>Mode *</label>
          <div style={S.radioGroup}>
            <label style={S.radioLabel}><input type="radio" name="umode" checked={mode === "new"} onChange={() => { setMode("new"); setSelUser(null); setForm({ name: "", username: "", password: "", active: true, admin: false }); }} /> New User</label>
            <label style={S.radioLabel}><input type="radio" name="umode" checked={mode === "existing"} onChange={() => setMode("existing")} /> Existing User</label>
          </div>
        </div>
        {mode === "existing" && (
          <div style={S.formGroup}>
            <label style={S.label}>Search User</label>
            <input style={S.input} value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Search by name..." />
            {searchName && filtered.length > 0 && (
              <div style={{ background: "#0f1117", border: "1px solid #2a3352", borderRadius: 6, marginTop: 4 }}>
                {filtered.map(u => <div key={u.id} onClick={() => { setSelUser(u); setForm({ name: u.name, username: u.username, password: u.password, active: u.active, admin: u.role === "admin" }); setSearchName(""); }} style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#c8cdd6", borderBottom: "1px solid #1a2030" }}>{u.name} ({u.username}) — {u.role}</div>)}
              </div>
            )}
          </div>
        )}
        <div style={S.formGroup}><label style={S.label}>Name *</label><input style={S.input} value={form.name} onChange={e => setF("name", e.target.value)} /></div>
        {mode === "new" && <div style={S.row2}>
          <div style={S.formGroup}><label style={S.label}>Username</label><input style={S.input} value={form.username} onChange={e => setF("username", e.target.value)} /></div>
          <div style={S.formGroup}><label style={S.label}>Password</label><input style={S.input} type="password" value={form.password} onChange={e => setF("password", e.target.value)} /></div>
        </div>}
        <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
          <label style={S.radioLabel}><input type="checkbox" checked={form.active} onChange={e => setF("active", e.target.checked)} /> Active</label>
          <label style={S.radioLabel}><input type="checkbox" checked={form.admin} onChange={e => setF("admin", e.target.checked)} /> Admin</label>
        </div>
        <button style={{ ...S.btnPrimary, marginTop: 14 }} onClick={handleSubmit}>{mode === "new" ? "Create User" : "Update User"}</button>
      </div>
    </div>
  );
}

function Maintenance({ data, setData }) {
  const [section, setSection] = useState("membership-add");
  const sections = [
    { key: "membership-add", label: "Add Membership", group: "Membership" },
    { key: "membership-update", label: "Update Membership", group: "Membership" },
    { key: "book-add", label: "Add Book/Movie", group: "Books/Movies" },
    { key: "book-update", label: "Update Book/Movie", group: "Books/Movies" },
    { key: "users", label: "User Management", group: "Users" },
  ];
  const groups = [...new Set(sections.map(s => s.group))];

  return (
    <div style={{ display: "flex", gap: 0 }}>
      <div style={{ ...S.sidebar, width: 160, flexShrink: 0, borderRadius: 8, marginRight: 16 }}>
        {groups.map(g => (
          <div key={g} style={S.sideGroup}>
            <div style={S.sideGroupLabel}>{g}</div>
            {sections.filter(s => s.group === g).map(s => (
              <button key={s.key} style={S.sideItem(section === s.key)} onClick={() => setSection(s.key)}>{s.label}</button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {section === "membership-add" && <AddMembership data={data} setData={setData} />}
        {section === "membership-update" && <UpdateMembership data={data} setData={setData} />}
        {section === "book-add" && <AddBook data={data} setData={setData} />}
        {section === "book-update" && <UpdateBook data={data} setData={setData} />}
        {section === "users" && <UserManagement data={data} setData={setData} />}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, user }) {
  const totalBooks = data.books.filter(b => b.type === "book").length;
  const totalMovies = data.books.filter(b => b.type === "movie").length;
  const activeIssues = data.issues.filter(i => i.status === "active").length;
  const overdues = data.issues.filter(i => i.status === "active" && new Date(i.returnDate) < new Date()).length;
  const activeMembers = data.memberships.filter(m => m.status === "active").length;

  const StatCard = ({ label, val, color = "#c9a84c", icon }) => (
    <div style={{ ...S.card, textAlign: "center" }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: "bold", color }}>{val}</div>
      <div style={{ fontSize: 12, color: "#8892a4", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Books" val={totalBooks} icon="📚" />
        <StatCard label="Total Movies" val={totalMovies} icon="🎬" />
        <StatCard label="Active Issues" val={activeIssues} icon="📤" color="#4ca8c9" />
        <StatCard label="Overdue" val={overdues} icon="🕐" color="#e84c4c" />
        <StatCard label="Members" val={activeMembers} icon="👥" color="#4ce84c" />
      </div>
      <div style={S.card}>
        <div style={{ fontWeight: "bold", color: "#c9a84c", marginBottom: 10 }}>Recent Active Issues</div>
        <Table
          cols={[{ key: "serialNo", label: "Serial" }, { key: "bookName", label: "Book" }, { key: "membershipId", label: "Member ID" }, { key: "issueDate", label: "Issued" }, { key: "returnDate", label: "Due", render: r => <span style={{ color: new Date(r.returnDate) < new Date() ? "#e84c4c" : "#4ce84c" }}>{r.returnDate}</span> }]}
          rows={data.issues.filter(i => i.status === "active").slice(0, 5)}
          noDataMsg="No active issues."
        />
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(INITIAL_DATA);
  const [page, setPage] = useState("dashboard");

  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setPage("dashboard"); };

  if (!user) return <LoginPage users={data.users} onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";

  const navItems = [
    { key: "dashboard", label: "Dashboard", group: "Overview" },
    ...(isAdmin ? [{ key: "maintenance", label: "Maintenance", group: "Admin" }] : []),
    { key: "reports", label: "Reports", group: "Library" },
    { key: "transactions", label: "Transactions", group: "Library" },
  ];
  const groups = [...new Set(navItems.map(n => n.group))];

  return (
    <div style={S.app}>
      <div style={S.topBar}>
        <div style={S.logo}>📚 Library Management System</div>
        <div style={S.topMeta}>
          <span style={S.badge(user.role)}>{user.role}</span>
          <span>{user.name}</span>
          <button style={S.logoutBtn} onClick={handleLogout}>Log Out 🚪</button>
        </div>
      </div>
      <div style={S.main}>
        <div style={S.sidebar}>
          {groups.map(g => (
            <div key={g} style={S.sideGroup}>
              <div style={S.sideGroupLabel}>{g}</div>
              {navItems.filter(n => n.group === g).map(n => (
                <button key={n.key} style={S.sideItem(page === n.key)} onClick={() => setPage(n.key)}>{n.label}</button>
              ))}
            </div>
          ))}
        </div>
        <div style={S.content}>
          {page === "dashboard" && <Dashboard data={data} user={user} />}
          {page === "transactions" && <Transactions data={data} setData={setData} />}
          {page === "reports" && <Reports data={data} />}
          {page === "maintenance" && isAdmin && <Maintenance data={data} setData={setData} />}
          {page === "maintenance" && !isAdmin && <div style={S.error}>Access Denied. Maintenance is restricted to Admin users only.</div>}
        </div>
      </div>
    </div>
  );
}