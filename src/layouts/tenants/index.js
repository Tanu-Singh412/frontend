import { useState, useEffect, useCallback } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Swal from "sweetalert2";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    planName: "1-Year",
    expiryDate: "",
    gstNumber: "",
    address: "",
    phone: "",
    companyLogo: null,
    logoPreview: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/tenants", {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error(err);
    }
  }, [user.token]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSaveTenant = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'companyLogo' && form[key]) {
          formData.append(key, form[key]);
        } else if (key !== 'logoPreview' && key !== 'companyLogo') {
          formData.append(key, form[key]);
        }
      });

      const url = editId 
        ? `http://localhost:5000/api/auth/tenants/${editId}`
        : "http://localhost:5000/api/auth/register-tenant";
      
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${user.token}` },
        body: formData,
      });

      if (res.ok) {
        Swal.fire("Success", editId ? "Tenant Updated!" : "Tenant Registered!", "success");
        setShowAdd(false);
        setEditId(null);
        setForm({ companyName: "", email: "", password: "", planName: "1-Year", expiryDate: "", gstNumber: "", address: "", phone: "", companyLogo: null, logoPreview: "" });
        fetchTenants();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({
      companyName: t.companyName || "",
      email: t.email || "",
      password: "", // Don't show password
      planName: t.planName || "1-Year",
      expiryDate: t.expiryDate ? new Date(t.expiryDate).toISOString().split('T')[0] : "",
      gstNumber: t.gstNumber || "",
      address: t.address || "",
      phone: t.phone || "",
      logoPreview: t.companyLogo || "",
    });
    setShowAdd(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`http://localhost:5000/api/auth/tenants/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        Swal.fire("Updated", `Tenant is now ${newStatus}`, "success");
        fetchTenants();
      }
    } catch (err) {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const columns = [
    { Header: "Logo", accessor: "logo", width: "10%" },
    { Header: "Company Name", accessor: "companyName", width: "20%" },
    { Header: "Email", accessor: "email", width: "20%" },
    { Header: "Status", accessor: "status", width: "15%" },
    { Header: "Expiry", accessor: "expiryDate", width: "15%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const rows = tenants.map((t) => ({
    logo: <img src={t.companyLogo || "https://via.placeholder.com/40"} alt="logo" style={{ width: "40px", borderRadius: "4px" }} />,
    companyName: t.companyName,
    email: t.email,
    status: (
      <MDBox
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: "4px",
          bgcolor: t.status === "Active" ? "#e8f5e9" : "#ffebee",
          color: t.status === "Active" ? "#2e7d32" : "#c62828",
          display: "inline-block",
          fontSize: "0.75rem",
          fontWeight: "bold"
        }}
      >
        {t.status}
      </MDBox>
    ),
    expiryDate: new Date(t.expiryDate).toLocaleDateString(),
    actions: (
      <MDBox display="flex" gap={1}>
        <IconButton color="info" size="small" onClick={() => handleEdit(t)}><Icon>edit</Icon></IconButton>
        <MDButton
          variant="text"
          color={t.status === "Active" ? "error" : "success"}
          size="small"
          onClick={() => toggleStatus(t._id, t.status)}
        >
          <Icon>{t.status === "Active" ? "block" : "check_circle"}</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h4">Tenant Management</MDTypography>
            <MDButton variant="gradient" color="info" onClick={() => { setShowAdd(!showAdd); if(showAdd) setEditId(null); }} sx={{ "&:hover": { bgcolor: "#1A73E8" } }}>
                {showAdd ? "Close" : "Add New Tenant"}
            </MDButton>
        </MDBox>

        {showAdd && (
          <Card sx={{ p: 3, mb: 3 }}>
            <MDTypography variant="h6" mb={2}>{editId ? "Edit Tenant" : "Register New Tenant"}</MDTypography>
            <MDBox display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <MDInput label="Company Name" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} />
              <MDInput label="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              <MDInput label="Password" type="password" placeholder={editId ? "(Leave blank to keep same)" : ""} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              <MDInput label="GST Number" value={form.gstNumber} onChange={(e) => setForm({...form, gstNumber: e.target.value})} />
              <MDInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              <MDInput label="Expiry Date" type="date" focused value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} />
              <MDInput label="Address" multiline rows={2} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
              
              <MDBox>
                <MDTypography variant="caption" display="block">Company Logo</MDTypography>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) setForm({...form, companyLogo: file, logoPreview: URL.createObjectURL(file)});
                }} />
                {form.logoPreview && <img src={form.logoPreview} alt="preview" style={{ width: "60px", marginTop: "10px", borderRadius: "4px" }} />}
              </MDBox>
            </MDBox>
            <MDBox mt={3} display="flex" gap={2}>
              <MDButton color="success" variant="gradient" onClick={handleSaveTenant} sx={{ "&:hover": { bgcolor: "#4CAF50" } }}>{editId ? "Update Tenant" : "Register Tenant"}</MDButton>
              {editId && <MDButton color="secondary" onClick={() => { setEditId(null); setShowAdd(false); }} sx={{ "&:hover": { bgcolor: "#7b809a" } }}>Cancel</MDButton>}
            </MDBox>
          </Card>
        )}

        <Card>
          <MDBox pt={3}>
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tenants;
