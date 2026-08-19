/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "assets", label: "Assets", icon: "▣" },
  { id: "vms", label: "Virtual Machines", icon: "▤" },
  { id: "monitoring", label: "Monitoring", icon: "◉" },
  { id: "alerts", label: "Alerts", icon: "!" },
  { id: "incidents", label: "Incidents", icon: "◇" },
  { id: "audit", label: "Audit", icon: "◌" },
];

const INCIDENT_USERS = [
  {
    id: 1,
    username: "testuser",
  },
  {
    id: 2,
    username: "testuser2",
  },
];

const EMPTY_ASSET = {
  assetTag: "",
  name: "",
  type: "SERVER",
  manufacturer: "",
  model: "",
  serialNumber: "",
  status: "ACTIVE",
  location: "",
  description: "",
};

const EMPTY_INCIDENT = {
  title: "",
  description: "",
  priority: "MEDIUM",
  virtualMachineId: "",
  alertId: "",
};

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("eimp_token") || null
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [currentUser, setCurrentUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const [activePage, setActivePage] = useState("dashboard");

  const [dashboard, setDashboard] = useState(null);
  const [assets, setAssets] = useState([]);
  const [vms, setVms] = useState([]);

  const [monitoringMetrics, setMonitoringMetrics] = useState([]);
  const [selectedVmId, setSelectedVmId] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState("active");

  const [incidents, setIncidents] = useState([]);
  const [incidentFilter, setIncidentFilter] = useState("ALL");
  const [incidentForm, setIncidentForm] =
    useState(EMPTY_INCIDENT);
  const [showIncidentForm, setShowIncidentForm] =
    useState(false);
  const [savingIncident, setSavingIncident] =
    useState(false);
  const [incidentActionLoading, setIncidentActionLoading] =
    useState(null);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditActionFilter, setAuditActionFilter] =
    useState("ALL");

  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET);
  const [savingAsset, setSavingAsset] = useState(false);

  const [vmActionLoading, setVmActionLoading] =
    useState(null);

  const [resolvingAlertId, setResolvingAlertId] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [authChecking, setAuthChecking] = useState(
    Boolean(localStorage.getItem("eimp_token"))
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearSession = () => {
    localStorage.removeItem("eimp_token");

    setToken(null);
    setCurrentUser("");
    setCurrentUserId(null);

    setDashboard(null);
    setAssets([]);
    setVms([]);
    setMonitoringMetrics([]);
    setSelectedVmId("");
    setAlerts([]);
    setIncidents([]);
    setAuditLogs([]);

    setEditingAsset(null);
    setIncidentForm(EMPTY_INCIDENT);
    setShowIncidentForm(false);

    setActivePage("dashboard");
    setError("");
    setSuccess("");
  };

  const login = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error(
          "Login response did not contain a token"
        );
      }

      localStorage.setItem(
        "eimp_token",
        data.token
      );

      setToken(data.token);
      setPassword("");
    } catch (err) {
      setError(
        err.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const loadCurrentUser = async (authToken = token) => {
    if (!authToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        clearSession();
        return false;
      }

      if (!response.ok) {
        throw new Error(
          "Authentication validation failed"
        );
      }

      const data = await response.json();

      if (!data.id || !data.username) {
        throw new Error(
          "Invalid current-user response"
        );
      }

      setCurrentUser(data.username);
      setCurrentUserId(data.id);

      return true;
    } catch (err) {
      console.error(
        "Authentication validation failed:",
        err
      );

      clearSession();
      return false;
    }
  };

  const handleUnauthorized = (response) => {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      clearSession();
      return true;
    }

    return false;
  };

  const loadDashboard = async (authToken = token) => {
    if (!authToken) {
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load dashboard"
        );
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load dashboard"
      );
    } finally {
      setPageLoading(false);
    }
  };

  const loadAssets = async () => {
    if (!token) {
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/assets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load assets"
        );
      }

      const data = await response.json();

      setAssets(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load assets"
      );
    } finally {
      setPageLoading(false);
    }
  };

  const loadVms = async () => {
    if (!token) {
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/vms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load virtual machines"
        );
      }

      const data = await response.json();

      setVms(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load virtual machines"
      );
    } finally {
      setPageLoading(false);
    }
  };

  const loadMonitoring = async (vmId) => {
    if (!token || !vmId) {
      setMonitoringMetrics([]);
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/monitoring/vms/${vmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load monitoring data"
        );
      }

      const data = await response.json();

      setMonitoringMetrics(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load monitoring data"
      );
      setMonitoringMetrics([]);
    } finally {
      setPageLoading(false);
    }
  };

  const loadAlerts = async (vmId, filter) => {
    if (!token || !vmId) {
      setAlerts([]);
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const endpoint =
        filter === "active"
          ? `${API_URL}/api/alerts/vms/${vmId}/active`
          : `${API_URL}/api/alerts/vms/${vmId}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load alerts"
        );
      }

      const data = await response.json();

      setAlerts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load alerts"
      );
      setAlerts([]);
    } finally {
      setPageLoading(false);
    }
  };

  const loadIncidents = async () => {
    if (!token) {
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const endpoint =
        incidentFilter === "ALL"
          ? `${API_URL}/api/incidents`
          : `${API_URL}/api/incidents/status/${incidentFilter}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load incidents"
        );
      }

      const data = await response.json();

      setIncidents(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load incidents"
      );
      setIncidents([]);
    } finally {
      setPageLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!token) {
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/audit`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load audit logs"
        );
      }

      const data = await response.json();

      setAuditLogs(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load audit logs"
      );
      setAuditLogs([]);
    } finally {
      setPageLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    setResolvingAlertId(alertId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/alerts/${alertId}/resolve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to resolve alert"
        );
      }

      const resolvedAlert =
        await response.json();

      setSuccess(
        `Alert #${resolvedAlert.id} resolved successfully.`
      );

      await loadAlerts(
        selectedVmId,
        alertFilter
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to resolve alert"
      );
    } finally {
      setResolvingAlertId(null);
    }
  };

  const createIncident = async (event) => {
    event.preventDefault();

    if (!currentUserId) {
      setError(
        "Unable to determine the authenticated user."
      );
      return;
    }

    setSavingIncident(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: incidentForm.title.trim(),
        description:
          incidentForm.description.trim(),
        priority: incidentForm.priority,
      };

      if (incidentForm.virtualMachineId) {
        payload.virtualMachineId = Number(
          incidentForm.virtualMachineId
        );
      }

      if (incidentForm.alertId) {
        payload.alertId = Number(
          incidentForm.alertId
        );
      }

      const response = await fetch(
        `${API_URL}/api/incidents?createdByUserId=${currentUserId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to create incident"
        );
      }

      const createdIncident =
        await response.json();

      setSuccess(
        `Incident #${createdIncident.id} created successfully.`
      );

      setIncidentForm(EMPTY_INCIDENT);
      setShowIncidentForm(false);

      await loadIncidents();
      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to create incident"
      );
    } finally {
      setSavingIncident(false);
    }
  };

  const assignIncident = async (
    incidentId,
    userId
  ) => {
    setIncidentActionLoading(
      `${incidentId}-assign`
    );
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/incidents/${incidentId}/assign/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to assign incident"
        );
      }

      const updatedIncident =
        await response.json();

      setSuccess(
        `Incident #${updatedIncident.id} assigned successfully.`
      );

      await loadIncidents();
      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to assign incident"
      );
    } finally {
      setIncidentActionLoading(null);
    }
  };

  const updateIncidentStatus = async (
    incidentId,
    status
  ) => {
    setIncidentActionLoading(
      `${incidentId}-${status}`
    );
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/incidents/${incidentId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to update incident status"
        );
      }

      const updatedIncident =
        await response.json();

      setSuccess(
        `Incident #${updatedIncident.id} changed to ${updatedIncident.status}.`
      );

      await loadIncidents();
      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update incident"
      );
    } finally {
      setIncidentActionLoading(null);
    }
  };

  const resolveIncident = async (incidentId) => {
    setIncidentActionLoading(
      `${incidentId}-resolve`
    );
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/incidents/${incidentId}/resolve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to resolve incident"
        );
      }

      const updatedIncident =
        await response.json();

      setSuccess(
        `Incident #${updatedIncident.id} resolved successfully.`
      );

      await loadIncidents();
      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to resolve incident"
      );
    } finally {
      setIncidentActionLoading(null);
    }
  };

  const closeIncident = async (incidentId) => {
    setIncidentActionLoading(
      `${incidentId}-close`
    );
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/incidents/${incidentId}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to close incident"
        );
      }

      const updatedIncident =
        await response.json();

      setSuccess(
        `Incident #${updatedIncident.id} closed successfully.`
      );

      await loadIncidents();
      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to close incident"
      );
    } finally {
      setIncidentActionLoading(null);
    }
  };

  const startEditingAsset = (asset) => {
    setError("");
    setSuccess("");

    setEditingAsset(asset);

    setAssetForm({
      assetTag: asset.assetTag || "",
      name: asset.name || "",
      type: asset.type || "SERVER",
      manufacturer: asset.manufacturer || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      status: asset.status || "ACTIVE",
      location: asset.location || "",
      description: asset.description || "",
    });
  };

  const cancelEditingAsset = () => {
    setEditingAsset(null);
    setAssetForm(EMPTY_ASSET);
  };

  const handleAssetFormChange = (event) => {
    const { name, value } = event.target;

    setAssetForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveAsset = async (event) => {
    event.preventDefault();

    if (!editingAsset) {
      return;
    }

    setSavingAsset(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/assets/${editingAsset.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assetForm),
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Unable to update asset"
        );
      }

      const updatedAsset =
        await response.json();

      setAssets((current) =>
        current.map((asset) =>
          asset.id === updatedAsset.id
            ? updatedAsset
            : asset
        )
      );

      setEditingAsset(null);
      setAssetForm(EMPTY_ASSET);

      setSuccess(
        `Asset #${updatedAsset.id} updated successfully.`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update asset"
      );
    } finally {
      setSavingAsset(false);
    }
  };

  const performVmAction = async (
    vmId,
    action
  ) => {
    setVmActionLoading(
      `${vmId}-${action}`
    );
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/vms/${vmId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            `Unable to ${action} virtual machine`
        );
      }

      const updatedVm =
        await response.json();

      setVms((current) =>
        current.map((vm) =>
          vm.id === updatedVm.id
            ? updatedVm
            : vm
        )
      );

      setSuccess(
        `Virtual machine "${updatedVm.name}" ${action} operation completed.`
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          `Unable to ${action} virtual machine`
      );
    } finally {
      setVmActionLoading(null);
    }
  };

  const changePage = (page) => {
    setActivePage(page);
    setError("");
    setSuccess("");

    setEditingAsset(null);
    setShowIncidentForm(false);

    if (page !== "alerts") {
      setAlertFilter("active");
    }

    if (page !== "incidents") {
      setIncidentFilter("ALL");
    }

    if (page !== "audit") {
      setAuditActionFilter("ALL");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeAuthentication = async () => {
      if (!token) {
        setAuthChecking(false);
        return;
      }

      setAuthChecking(true);

      const authenticated =
        await loadCurrentUser(token);

      if (cancelled) {
        return;
      }

      if (!authenticated) {
        setAuthChecking(false);
        return;
      }

      await loadDashboard(token);

      if (!cancelled) {
        setAuthChecking(false);
      }
    };

    initializeAuthentication();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || authChecking) {
      return;
    }

    if (activePage === "assets") {
      loadAssets();
    }

    if (activePage === "vms") {
      loadVms();
    }

    if (activePage === "monitoring") {
      loadVms();
    }

    if (activePage === "alerts") {
      loadVms();
    }

    if (activePage === "incidents") {
      loadVms();
      loadIncidents();
    }

    if (activePage === "audit") {
      loadAuditLogs();
    }
  }, [
    activePage,
    token,
    incidentFilter,
    authChecking,
  ]);

  useEffect(() => {
    if (
      !token ||
      authChecking ||
      activePage !== "monitoring" ||
      !selectedVmId
    ) {
      return;
    }

    loadMonitoring(selectedVmId);
  }, [
    selectedVmId,
    activePage,
    token,
    authChecking,
  ]);

  useEffect(() => {
    if (
      !token ||
      authChecking ||
      activePage !== "alerts" ||
      !selectedVmId
    ) {
      return;
    }

    loadAlerts(
      selectedVmId,
      alertFilter
    );
  }, [
    selectedVmId,
    alertFilter,
    activePage,
    token,
    authChecking,
  ]);

  useEffect(() => {
    if (
      activePage !== "monitoring" &&
      activePage !== "alerts"
    ) {
      return;
    }

    if (vms.length === 0) {
      if (selectedVmId !== "") {
        setSelectedVmId("");
      }

      return;
    }

    const selectedStillExists =
      vms.some(
        (vm) =>
          String(vm.id) ===
          String(selectedVmId)
      );

    if (
      !selectedVmId ||
      !selectedStillExists
    ) {
      setSelectedVmId(
        String(vms[0].id)
      );
    }
  }, [
    vms,
    activePage,
    selectedVmId,
  ]);

  const filteredAuditLogs =
    auditActionFilter === "ALL"
      ? auditLogs
      : auditLogs.filter(
          (log) =>
            log.action ===
            auditActionFilter
        );

  const auditActions = [
    ...new Set(
      auditLogs
        .map((log) => log.action)
        .filter(Boolean)
    ),
  ];

  if (authChecking) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand">
            <div className="brand-badge">
              E
            </div>

            <div>
              <h1>EIMP</h1>
              <p>
                Enterprise Infrastructure
                Management Platform
              </p>
            </div>
          </div>

          <h2>
            Checking session...
          </h2>

          <p className="login-subtitle">
            Validating your authentication session.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <LoginPage
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        login={login}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={changePage}
        onLogout={logout}
      />

      <div className="main-area">
        <header className="topbar">
          <div>
            <strong>EIMP</strong>

            <span>
              Enterprise Infrastructure Management
            </span>
          </div>

          <div className="topbar-actions">
            <span className="user-badge">
              {currentUser || username}
            </span>
          </div>
        </header>

        <main className="page-content">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {success && (
            <div className="success-banner">
              {success}
            </div>
          )}

          {activePage === "dashboard" && (
            <DashboardPage
              dashboard={dashboard}
              loading={pageLoading}
              onRefresh={loadDashboard}
            />
          )}

          {activePage === "assets" && (
            <AssetsPage
              assets={assets}
              loading={pageLoading}
              editingAsset={editingAsset}
              assetForm={assetForm}
              savingAsset={savingAsset}
              onRefresh={loadAssets}
              onEdit={startEditingAsset}
              onCancelEdit={cancelEditingAsset}
              onFormChange={handleAssetFormChange}
              onSave={saveAsset}
            />
          )}

          {activePage === "vms" && (
            <VirtualMachinesPage
              vms={vms}
              loading={pageLoading}
              actionLoading={vmActionLoading}
              onRefresh={loadVms}
              onAction={performVmAction}
            />
          )}

          {activePage === "monitoring" && (
            <MonitoringPage
              vms={vms}
              selectedVmId={selectedVmId}
              setSelectedVmId={setSelectedVmId}
              metrics={monitoringMetrics}
              loading={pageLoading}
              onRefresh={() => {
                if (selectedVmId) {
                  loadMonitoring(
                    selectedVmId
                  );
                }
              }}
            />
          )}

          {activePage === "alerts" && (
            <AlertsPage
              vms={vms}
              selectedVmId={selectedVmId}
              setSelectedVmId={setSelectedVmId}
              alerts={alerts}
              filter={alertFilter}
              setFilter={setAlertFilter}
              loading={pageLoading}
              resolvingAlertId={
                resolvingAlertId
              }
              onRefresh={() =>
                selectedVmId &&
                loadAlerts(
                  selectedVmId,
                  alertFilter
                )
              }
              onResolve={resolveAlert}
            />
          )}

          {activePage === "incidents" && (
            <IncidentsPage
              incidents={incidents}
              vms={vms}
              alerts={alerts}
              loading={pageLoading}
              filter={incidentFilter}
              setFilter={setIncidentFilter}
              form={incidentForm}
              setForm={setIncidentForm}
              showForm={showIncidentForm}
              setShowForm={setShowIncidentForm}
              saving={savingIncident}
              actionLoading={
                incidentActionLoading
              }
              onCreate={createIncident}
              onAssign={assignIncident}
              onStatus={updateIncidentStatus}
              onResolve={resolveIncident}
              onClose={closeIncident}
              onRefresh={loadIncidents}
            />
          )}

          {activePage === "audit" && (
            <AuditPage
              logs={filteredAuditLogs}
              allLogs={auditLogs}
              actions={auditActions}
              filter={auditActionFilter}
              setFilter={setAuditActionFilter}
              loading={pageLoading}
              onRefresh={loadAuditLogs}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LoginPage({
  username,
  password,
  setUsername,
  setPassword,
  login,
  loading,
  error,
}) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-badge">
            E
          </div>

          <div>
            <h1>EIMP</h1>

            <p>
              Enterprise Infrastructure
              Management Platform
            </p>
          </div>
        </div>

        <h2>Sign in</h2>

        <p className="login-subtitle">
          Access your infrastructure management
          dashboard.
        </p>

        <form onSubmit={login}>
          <label htmlFor="username">
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            required
            autoComplete="username"
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({
  activePage,
  onNavigate,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">
          E
        </div>

        <div>
          <strong>EIMP</strong>
          <span>Infrastructure</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activePage === item.id
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              onNavigate(item.id)
            }
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="logout-sidebar-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function DashboardPage({
  dashboard,
  loading,
  onRefresh,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            OPERATIONS
          </p>

          <h1>
            Infrastructure Dashboard
          </h1>

          <p className="dashboard-description">
            Current overview of assets,
            virtual machines, alerts and
            incidents.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {!dashboard && loading && (
        <div className="loading-card">
          Loading dashboard...
        </div>
      )}

      {dashboard && (
        <>
          <section className="stats-grid">
            <StatCard
              label="Total Assets"
              value={dashboard.totalAssets}
              description={`${dashboard.activeAssets} active`}
            />

            <StatCard
              label="Virtual Machines"
              value={dashboard.totalVirtualMachines}
              description={`${dashboard.runningVirtualMachines} running`}
            />

            <StatCard
              label="Active Alerts"
              value={dashboard.activeAlerts}
              description={`${dashboard.criticalAlerts} critical`}
              danger={
                dashboard.criticalAlerts > 0
              }
            />

            <StatCard
              label="Open Incidents"
              value={
                dashboard.openIncidents +
                dashboard.assignedIncidents +
                dashboard.inProgressIncidents
              }
              description={`${dashboard.closedIncidents} closed`}
            />
          </section>

          <section className="content-grid">
            <DashboardPanel title="Virtual Machines">
              <MetricRow
                label="Running"
                value={
                  dashboard.runningVirtualMachines
                }
              />

              <MetricRow
                label="Stopped"
                value={
                  dashboard.stoppedVirtualMachines
                }
              />

              <MetricRow
                label="Paused"
                value={
                  dashboard.pausedVirtualMachines
                }
              />
            </DashboardPanel>

            <DashboardPanel title="Alerts">
              <MetricRow
                label="Critical"
                value={
                  dashboard.criticalAlerts
                }
                highlight={
                  dashboard.criticalAlerts > 0
                }
              />

              <MetricRow
                label="Warning"
                value={
                  dashboard.warningAlerts
                }
              />

              <MetricRow
                label="Total Active"
                value={
                  dashboard.activeAlerts
                }
              />
            </DashboardPanel>

            <DashboardPanel title="Incidents">
              <MetricRow
                label="Open"
                value={dashboard.openIncidents}
              />

              <MetricRow
                label="Assigned"
                value={
                  dashboard.assignedIncidents
                }
              />

              <MetricRow
                label="In Progress"
                value={
                  dashboard.inProgressIncidents
                }
              />

              <MetricRow
                label="Resolved"
                value={
                  dashboard.resolvedIncidents
                }
              />

              <MetricRow
                label="Closed"
                value={
                  dashboard.closedIncidents
                }
              />
            </DashboardPanel>

            <DashboardPanel title="Assets">
              <MetricRow
                label="Total"
                value={dashboard.totalAssets}
              />

              <MetricRow
                label="Active"
                value={dashboard.activeAssets}
              />

              <MetricRow
                label="Inactive"
                value={
                  dashboard.inactiveAssets
                }
              />
            </DashboardPanel>
          </section>
        </>
      )}
    </>
  );
}

function AssetsPage({
  assets,
  loading,
  editingAsset,
  assetForm,
  savingAsset,
  onRefresh,
  onEdit,
  onCancelEdit,
  onFormChange,
  onSave,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            INVENTORY
          </p>

          <h1>Assets</h1>

          <p className="dashboard-description">
            Infrastructure assets currently
            registered in EIMP.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {editingAsset && (
        <AssetEditForm
          asset={editingAsset}
          form={assetForm}
          saving={savingAsset}
          onChange={onFormChange}
          onCancel={onCancelEdit}
          onSave={onSave}
        />
      )}

      {loading && (
        <div className="loading-card">
          Loading assets...
        </div>
      )}

      {!loading && assets.length === 0 && (
        <div className="loading-card">
          No assets found.
        </div>
      )}

      {!loading && assets.length > 0 && (
        <section className="table-card">
          <div className="table-header">
            <h2>Asset Inventory</h2>

            <span>
              {assets.length} asset(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asset Tag</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Manufacturer</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>

                    <td>
                      {asset.assetTag || "—"}
                    </td>

                    <td>
                      {asset.name || "—"}
                    </td>

                    <td>
                      {asset.type || "—"}
                    </td>

                    <td>
                      {asset.manufacturer || "—"}
                    </td>

                    <td>
                      {asset.model || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          asset.status === "ACTIVE"
                            ? "status-badge active"
                            : "status-badge"
                        }
                      >
                        {asset.status ||
                          "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      {asset.location || "—"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() =>
                          onEdit(asset)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function AssetEditForm({
  asset,
  form,
  saving,
  onChange,
  onCancel,
  onSave,
}) {
  return (
    <section className="edit-card">
      <div className="edit-card-header">
        <div>
          <p className="eyebrow">
            ASSET MANAGEMENT
          </p>

          <h2>
            Edit Asset #{asset.id}
          </h2>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <form
        className="asset-form"
        onSubmit={onSave}
      >
        <div className="form-field">
          <label htmlFor="assetTag">
            Asset Tag
          </label>

          <input
            id="assetTag"
            name="assetTag"
            value={form.assetTag}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="type">
            Type
          </label>

          <input
            id="type"
            name="type"
            value={form.type}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="manufacturer">
            Manufacturer
          </label>

          <input
            id="manufacturer"
            name="manufacturer"
            value={form.manufacturer}
            onChange={onChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="model">
            Model
          </label>

          <input
            id="model"
            name="model"
            value={form.model}
            onChange={onChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="serialNumber">
            Serial Number
          </label>

          <input
            id="serialNumber"
            name="serialNumber"
            value={form.serialNumber}
            onChange={onChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">
            Status
          </label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={onChange}
          >
            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            name="location"
            value={form.location}
            onChange={onChange}
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="4"
          />
        </div>

        <div className="form-actions full-width">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button form-submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function VirtualMachinesPage({
  vms,
  loading,
  actionLoading,
  onRefresh,
  onAction,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            COMPUTE
          </p>

          <h1>
            Virtual Machines
          </h1>

          <p className="dashboard-description">
            Manage VM inventory and lifecycle
            operations.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="loading-card">
          Loading virtual machines...
        </div>
      )}

      {!loading && vms.length === 0 && (
        <div className="loading-card">
          No virtual machines found.
        </div>
      )}

      {!loading && vms.length > 0 && (
        <section className="table-card">
          <div className="table-header">
            <h2>
              Virtual Machine Inventory
            </h2>

            <span>
              {vms.length} VM(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Hostname</th>
                  <th>Status</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Storage</th>
                  <th>OS</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {vms.map((vm) => (
                  <tr key={vm.id}>
                    <td>{vm.id}</td>

                    <td>
                      {vm.name || "—"}
                    </td>

                    <td>
                      {vm.hostname || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          vm.status ===
                          "RUNNING"
                            ? "status-badge active"
                            : "status-badge"
                        }
                      >
                        {vm.status ||
                          "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      {vm.cpuCores != null
                        ? `${vm.cpuCores} cores`
                        : "—"}
                    </td>

                    <td>
                      {vm.ramGb != null
                        ? `${vm.ramGb} GB`
                        : "—"}
                    </td>

                    <td>
                      {vm.storageGb != null
                        ? `${vm.storageGb} GB`
                        : "—"}
                    </td>

                    <td>
                      {vm.operatingSystem ||
                        "—"}
                    </td>

                    <td>
                      {vm.ipAddress || "—"}
                    </td>

                    <td>
                      <div className="vm-actions">
                        {vm.status !==
                          "RUNNING" && (
                          <VmActionButton
                            label="Start"
                            action="start"
                            vmId={vm.id}
                            actionLoading={
                              actionLoading
                            }
                            onAction={onAction}
                          />
                        )}

                        {vm.status !==
                          "STOPPED" && (
                          <VmActionButton
                            label="Stop"
                            action="stop"
                            vmId={vm.id}
                            actionLoading={
                              actionLoading
                            }
                            onAction={onAction}
                          />
                        )}

                        <VmActionButton
                          label="Pause"
                          action="pause"
                          vmId={vm.id}
                          actionLoading={
                            actionLoading
                          }
                          onAction={onAction}
                        />

                        <VmActionButton
                          label="Reboot"
                          action="reboot"
                          vmId={vm.id}
                          actionLoading={
                            actionLoading
                          }
                          onAction={onAction}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function VmActionButton({
  label,
  action,
  vmId,
  actionLoading,
  onAction,
}) {
  const isLoading =
    actionLoading ===
    `${vmId}-${action}`;

  return (
    <button
      type="button"
      className="vm-action-button"
      onClick={() =>
        onAction(
          vmId,
          action
        )
      }
      disabled={
        actionLoading !== null
      }
    >
      {isLoading ? "..." : label}
    </button>
  );
}

function MonitoringPage({
  vms,
  selectedVmId,
  setSelectedVmId,
  metrics,
  loading,
  onRefresh,
}) {
  const latestMetric =
    metrics.length > 0
      ? metrics[0]
      : null;

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            OBSERVABILITY
          </p>

          <h1>Monitoring</h1>

          <p className="dashboard-description">
            View CPU, memory, disk and network
            metrics for your virtual machines.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={!selectedVmId || loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <section className="monitoring-selector-card">
        <label htmlFor="monitoringVm">
          Virtual Machine
        </label>

        <select
          id="monitoringVm"
          value={selectedVmId}
          onChange={(event) =>
            setSelectedVmId(
              event.target.value
            )
          }
        >
          <option value="">
            Select a virtual machine
          </option>

          {vms.map((vm) => (
            <option
              key={vm.id}
              value={vm.id}
            >
              {vm.name} ({vm.hostname})
            </option>
          ))}
        </select>
      </section>

      {selectedVmId && latestMetric && (
        <>
          <section className="monitoring-stats-grid">
            <MonitoringCard
              label="CPU Usage"
              value={`${latestMetric.cpuUsagePercent}%`}
              danger={
                latestMetric.cpuUsagePercent >=
                90
              }
              warning={
                latestMetric.cpuUsagePercent >= 80 &&
                latestMetric.cpuUsagePercent < 90
              }
            />

            <MonitoringCard
              label="RAM Usage"
              value={`${latestMetric.ramUsagePercent}%`}
              danger={
                latestMetric.ramUsagePercent >=
                90
              }
              warning={
                latestMetric.ramUsagePercent >= 80 &&
                latestMetric.ramUsagePercent < 90
              }
            />

            <MonitoringCard
              label="Disk Usage"
              value={`${latestMetric.diskUsagePercent}%`}
              danger={
                latestMetric.diskUsagePercent >=
                90
              }
              warning={
                latestMetric.diskUsagePercent >= 80 &&
                latestMetric.diskUsagePercent < 90
              }
            />

            <MonitoringCard
              label="Network In"
              value={`${latestMetric.networkInMbps} Mbps`}
            />

            <MonitoringCard
              label="Network Out"
              value={`${latestMetric.networkOutMbps} Mbps`}
            />

            <MonitoringCard
              label="Recorded At"
              value={formatDate(
                latestMetric.recordedAt
              )}
            />
          </section>

          <section className="table-card monitoring-history">
            <div className="table-header">
              <h2>
                Monitoring History
              </h2>

              <span>
                {metrics.length} record(s)
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Recorded At</th>
                    <th>CPU</th>
                    <th>RAM</th>
                    <th>Disk</th>
                    <th>Network In</th>
                    <th>Network Out</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.id}>
                      <td>
                        {formatDate(
                          metric.recordedAt
                        )}
                      </td>

                      <td>
                        {metric.cpuUsagePercent}%
                      </td>

                      <td>
                        {metric.ramUsagePercent}%
                      </td>

                      <td>
                        {metric.diskUsagePercent}%
                      </td>

                      <td>
                        {metric.networkInMbps} Mbps
                      </td>

                      <td>
                        {metric.networkOutMbps} Mbps
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedVmId &&
        !loading &&
        metrics.length === 0 && (
          <div className="loading-card">
            No monitoring metrics found for
            this virtual machine.
          </div>
        )}

      {!selectedVmId &&
        !loading && (
          <div className="loading-card">
            Select a virtual machine to
            view monitoring data.
          </div>
        )}
    </>
  );
}

function MonitoringCard({
  label,
  value,
  danger = false,
  warning = false,
}) {
  let className = "monitoring-card";

  if (danger) {
    className += " danger";
  } else if (warning) {
    className += " warning";
  }

  return (
    <article className={className}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AlertsPage({
  vms,
  selectedVmId,
  setSelectedVmId,
  alerts,
  filter,
  setFilter,
  loading,
  resolvingAlertId,
  onRefresh,
  onResolve,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            OPERATIONS
          </p>

          <h1>Alerts</h1>

          <p className="dashboard-description">
            Review active and resolved
            infrastructure alerts.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={!selectedVmId || loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <section className="alerts-controls">
        <div className="monitoring-selector-card alert-selector">
          <label htmlFor="alertVm">
            Virtual Machine
          </label>

          <select
            id="alertVm"
            value={selectedVmId}
            onChange={(event) =>
              setSelectedVmId(
                event.target.value
              )
            }
          >
            <option value="">
              Select a virtual machine
            </option>

            {vms.map((vm) => (
              <option
                key={vm.id}
                value={vm.id}
              >
                {vm.name} ({vm.hostname})
              </option>
            ))}
          </select>
        </div>

        <div className="alert-filter">
          <button
            type="button"
            className={
              filter === "active"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("active")
            }
          >
            Active
          </button>

          <button
            type="button"
            className={
              filter === "all"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>
        </div>
      </section>

      {loading && (
        <div className="loading-card">
          Loading alerts...
        </div>
      )}

      {!loading &&
        selectedVmId &&
        alerts.length === 0 && (
          <div className="loading-card">
            No{" "}
            {filter === "active"
              ? "active "
              : ""}
            alerts found for this virtual
            machine.
          </div>
        )}

      {!loading &&
        alerts.length > 0 && (
          <section className="table-card">
            <div className="table-header">
              <h2>
                {filter === "active"
                  ? "Active Alerts"
                  : "Alert History"}
              </h2>

              <span>
                {alerts.length} alert(s)
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actual</th>
                    <th>Threshold</th>
                    <th>Message</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>{alert.id}</td>

                      <td>
                        <span className="alert-type-badge">
                          {alert.type}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            alert.severity ===
                            "CRITICAL"
                              ? "severity-badge critical"
                              : "severity-badge warning"
                          }
                        >
                          {alert.severity}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            alert.status === "ACTIVE"
                              ? "status-badge active"
                              : "status-badge"
                          }
                        >
                          {alert.status}
                        </span>
                      </td>

                      <td>
                        {alert.actualValue}%
                      </td>

                      <td>
                        {alert.thresholdValue}%
                      </td>

                      <td className="alert-message">
                        {alert.message}
                      </td>

                      <td>
                        {formatDate(
                          alert.createdAt
                        )}
                      </td>

                      <td>
                        {alert.status ===
                        "ACTIVE" ? (
                          <button
                            type="button"
                            className="resolve-button"
                            onClick={() =>
                              onResolve(
                                alert.id
                              )
                            }
                            disabled={
                              resolvingAlertId !== null
                            }
                          >
                            {resolvingAlertId ===
                            alert.id
                              ? "Resolving..."
                              : "Resolve"}
                          </button>
                        ) : (
                          <span className="resolved-label">
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      {!selectedVmId &&
        !loading && (
          <div className="loading-card">
            Select a virtual machine to view
            alerts.
          </div>
        )}
    </>
  );
}

function IncidentsPage({
  incidents,
  vms,
  alerts,
  loading,
  filter,
  setFilter,
  form,
  setForm,
  showForm,
  setShowForm,
  saving,
  actionLoading,
  onCreate,
  onAssign,
  onStatus,
  onResolve,
  onClose,
  onRefresh,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            SERVICE MANAGEMENT
          </p>

          <h1>Incidents</h1>

          <p className="dashboard-description">
            Track, assign and resolve
            infrastructure incidents.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="primary-button create-button"
            onClick={() =>
              setShowForm(
                (current) => !current
              )
            }
          >
            {showForm
              ? "Cancel"
              : "New Incident"}
          </button>
        </div>
      </div>

      {showForm && (
        <section className="edit-card incident-form-card">
          <div className="edit-card-header">
            <div>
              <p className="eyebrow">
                INCIDENT MANAGEMENT
              </p>

              <h2>
                Create Incident
              </h2>
            </div>
          </div>

          <form
            className="incident-form"
            onSubmit={onCreate}
          >
            <div className="form-field">
              <label htmlFor="incidentTitle">
                Title
              </label>

              <input
                id="incidentTitle"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="incidentPriority">
                Priority
              </label>

              <select
                id="incidentPriority"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority:
                      event.target.value,
                  }))
                }
              >
                <option value="LOW">
                  LOW
                </option>

                <option value="MEDIUM">
                  MEDIUM
                </option>

                <option value="HIGH">
                  HIGH
                </option>

                <option value="CRITICAL">
                  CRITICAL
                </option>
              </select>
            </div>

            <div className="form-field full-width">
              <label htmlFor="incidentDescription">
                Description
              </label>

              <textarea
                id="incidentDescription"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                rows="4"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="incidentVm">
                Virtual Machine
              </label>

              <select
                id="incidentVm"
                value={form.virtualMachineId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    virtualMachineId:
                      event.target.value,
                  }))
                }
              >
                <option value="">
                  No VM selected
                </option>

                {vms.map((vm) => (
                  <option
                    key={vm.id}
                    value={vm.id}
                  >
                    {vm.name} ({vm.hostname})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="incidentAlert">
                Alert
              </label>

              <select
                id="incidentAlert"
                value={form.alertId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    alertId:
                      event.target.value,
                  }))
                }
              >
                <option value="">
                  No alert linked
                </option>

                {alerts.map((alert) => (
                  <option
                    key={alert.id}
                    value={alert.id}
                  >
                    #{alert.id} -{" "}
                    {alert.type}{" "}
                    {alert.severity}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions full-width">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button form-submit"
                disabled={saving}
              >
                {saving
                  ? "Creating..."
                  : "Create Incident"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="incident-filters">
        {[
          "ALL",
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "RESOLVED",
          "CLOSED",
        ].map((status) => (
          <button
            key={status}
            type="button"
            className={
              filter === status
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter(status)
            }
          >
            {status === "IN_PROGRESS"
              ? "In Progress"
              : status}
          </button>
        ))}
      </section>

      {loading && (
        <div className="loading-card">
          Loading incidents...
        </div>
      )}

      {!loading &&
        incidents.length === 0 && (
          <div className="loading-card">
            No incidents found.
          </div>
        )}

      {!loading &&
        incidents.length > 0 && (
          <section className="incident-list">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                actionLoading={
                  actionLoading
                }
                onAssign={onAssign}
                onStatus={onStatus}
                onResolve={onResolve}
                onClose={onClose}
              />
            ))}
          </section>
        )}
    </>
  );
}

function IncidentCard({
  incident,
  actionLoading,
  onAssign,
  onStatus,
  onResolve,
  onClose,
}) {
  const isResolved =
    incident.status === "RESOLVED";

  const isClosed =
    incident.status === "CLOSED";

  return (
    <article className="incident-card">
      <div className="incident-card-header">
        <div>
          <div className="incident-title-row">
            <h2>
              #{incident.id}{" "}
              {incident.title}
            </h2>

            <span
              className={`incident-priority ${String(
                incident.priority
              ).toLowerCase()}`}
            >
              {incident.priority}
            </span>
          </div>

          <p className="incident-description">
            {incident.description}
          </p>
        </div>

        <span
          className={
            incident.status === "OPEN"
              ? "incident-status open"
              : incident.status ===
                  "IN_PROGRESS"
                ? "incident-status progress"
                : incident.status ===
                    "RESOLVED"
                  ? "incident-status resolved"
                  : incident.status ===
                      "CLOSED"
                    ? "incident-status closed"
                    : "incident-status"
          }
        >
          {incident.status}
        </span>
      </div>

      <div className="incident-meta">
        <div>
          <span>Created by</span>
          <strong>
            {incident.createdBy?.username ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Assigned to</span>
          <strong>
            {incident.assignedTo?.username ||
              "Unassigned"}
          </strong>
        </div>

        <div>
          <span>Virtual Machine</span>
          <strong>
            {incident.virtualMachine?.name ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Alert</span>
          <strong>
            {incident.alert
              ? `#${incident.alert.id} ${incident.alert.type}`
              : "—"}
          </strong>
        </div>

        <div>
          <span>Created</span>
          <strong>
            {formatDate(
              incident.createdAt
            )}
          </strong>
        </div>

        <div>
          <span>Resolved</span>
          <strong>
            {formatDate(
              incident.resolvedAt
            )}
          </strong>
        </div>
      </div>

      {!isClosed && (
        <div className="incident-actions">
          <div className="incident-action-group">
            <label
              htmlFor={`assign-${incident.id}`}
            >
              Assign
            </label>

            <select
              id={`assign-${incident.id}`}
              defaultValue={
                incident.assignedTo?.id || ""
              }
              onChange={(event) => {
                if (!event.target.value) {
                  return;
                }

                onAssign(
                  incident.id,
                  Number(event.target.value)
                );
              }}
              disabled={
                actionLoading !== null
              }
            >
              <option value="">
                Select user
              </option>

              {INCIDENT_USERS.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {!isResolved && (
            <div className="incident-action-group">
              <label
                htmlFor={`status-${incident.id}`}
              >
                Status
              </label>

              <select
                id={`status-${incident.id}`}
                value={incident.status}
                onChange={(event) =>
                  onStatus(
                    incident.id,
                    event.target.value
                  )
                }
                disabled={
                  actionLoading !== null
                }
              >
                <option value="OPEN">
                  OPEN
                </option>

                <option value="ASSIGNED">
                  ASSIGNED
                </option>

                <option value="IN_PROGRESS">
                  IN_PROGRESS
                </option>
              </select>
            </div>
          )}

          <div className="incident-action-buttons">
            {!isResolved && (
              <button
                type="button"
                className="resolve-button"
                onClick={() =>
                  onResolve(incident.id)
                }
                disabled={
                  actionLoading !== null
                }
              >
                {actionLoading ===
                `${incident.id}-resolve`
                  ? "Resolving..."
                  : "Resolve"}
              </button>
            )}

            {isResolved && (
              <button
                type="button"
                className="close-incident-button"
                onClick={() =>
                  onClose(incident.id)
                }
                disabled={
                  actionLoading !== null
                }
              >
                {actionLoading ===
                `${incident.id}-close`
                  ? "Closing..."
                  : "Close"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function AuditPage({
  logs,
  allLogs,
  actions,
  filter,
  setFilter,
  loading,
  onRefresh,
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            SECURITY
          </p>

          <h1>Audit</h1>

          <p className="dashboard-description">
            Review infrastructure activity
            recorded by EIMP.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <section className="audit-summary-grid">
        <AuditSummaryCard
          label="Total Events"
          value={allLogs.length}
        />

        <AuditSummaryCard
          label="Successful"
          value={
            allLogs.filter(
              (log) => log.success === true
            ).length
          }
        />

        <AuditSummaryCard
          label="Failed"
          value={
            allLogs.filter(
              (log) => log.success === false
            ).length
          }
        />

        <AuditSummaryCard
          label="Actions"
          value={actions.length}
        />
      </section>

      <section className="audit-toolbar">
        <label htmlFor="auditAction">
          Action
        </label>

        <select
          id="auditAction"
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
        >
          <option value="ALL">
            All actions
          </option>

          {actions
            .slice()
            .sort()
            .map((action) => (
              <option
                key={action}
                value={action}
              >
                {action}
              </option>
            ))}
        </select>
      </section>

      {loading && (
        <div className="loading-card">
          Loading audit logs...
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="loading-card">
          No audit records found.
        </div>
      )}

      {!loading && logs.length > 0 && (
        <section className="table-card">
          <div className="table-header">
            <h2>
              Audit History
            </h2>

            <span>
              {logs.length} event(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Resource ID</th>
                  <th>Success</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {formatDate(
                        log.createdAt
                      )}
                    </td>

                    <td>
                      {log.user?.username ||
                        "System / Unknown"}
                    </td>

                    <td>
                      <span className="audit-action-badge">
                        {log.action}
                      </span>
                    </td>

                    <td>
                      {log.resourceType ||
                        "—"}
                    </td>

                    <td>
                      {log.resourceId || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          log.success
                            ? "success-badge"
                            : "failure-badge"
                        }
                      >
                        {log.success
                          ? "SUCCESS"
                          : "FAILED"}
                      </span>
                    </td>

                    <td className="audit-description">
                      {log.description ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function AuditSummaryCard({
  label,
  value,
}) {
  return (
    <article className="audit-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatCard({
  label,
  value,
  description,
  danger = false,
}) {
  return (
    <article
      className={
        danger
          ? "stat-card danger"
          : "stat-card"
      }
    >
      <span className="stat-label">
        {label}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-description">
        {description}
      </span>
    </article>
  );
}

function DashboardPanel({
  title,
  children,
}) {
  return (
    <section className="dashboard-panel">
      <h2>{title}</h2>

      <div className="panel-content">
        {children}
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="metric-row">
      <span>{label}</span>

      <strong
        className={
          highlight
            ? "highlight"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default App;