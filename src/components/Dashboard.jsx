import { useEffect, useState } from "react";
import {
  Check,
  LayoutDashboard,
  LogOut,
  Mail,
  Pencil,
  Shield,
  X,
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function Dashboard({ user, onLogout, onUpdateProfile }) {
  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";
  const isAdmin = user.role === "admin";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (activeTab !== "admin" || !isAdmin) return undefined;

    const controller = new AbortController();
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError("");

      try {
        const response = await fetch(`${API_URL}/users`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Could Not Load Registered Users.");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The Server Returned An Invalid User List.");
        }
        setUsers(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setUsersError(error.message || "Could Not Load Registered Users.");
        }
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    };

    loadUsers();
    return () => controller.abort();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab !== "admin" || !isAdmin) return undefined;

    const controller = new AbortController();
    const loadActivity = async () => {
      setActivityLoading(true);
      setActivityError("");

      try {
        const response = await fetch(`${API_URL}/admin/activity`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Could Not Load Login And Logout Activity.");
        }
        const data = await response.json();
        if (!Array.isArray(data.activity)) {
          throw new Error("The Server Returned Invalid Activity Data.");
        }
        setActivity(data.activity);
      } catch (error) {
        if (error.name !== "AbortError") {
          setActivityError(
            error.message || "Could Not Load Login And Logout Activity.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setActivityLoading(false);
      }
    };

    loadActivity();
    return () => controller.abort();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!profileMessage) return undefined;

    const timeoutId = window.setTimeout(() => setProfileMessage(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [profileMessage]);

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const cancelProfileEdit = () => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfileError("");
    setProfileMessage("");
    setIsEditingProfile(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);

    try {
      const result = await onUpdateProfile(profileName, profileEmail);
      if (!result.success) {
        setProfileError(result.error);
        return;
      }

      setProfileName(result.user.name);
      setProfileEmail(result.user.email);
      setIsEditingProfile(false);
      setProfileMessage("Profile Updated Successfully.");
    } catch (error) {
      setProfileError(
        error.message || "Could Not Update Account Details.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const confirmLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    setLogoutError("");
    setLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      setLogoutError(error.message || "Could Not Log Out. Please Try Again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="#dashboard">
          <span>BKS Triad</span>
        </a>
        <button
          className="dashboard-logout"
          type="button"
          onClick={confirmLogout}
          disabled={loggingOut}
        >
          <LogOut size={17} aria-hidden="true" />
          <span>{loggingOut ? "Logging Out..." : "Log Out"}</span>
        </button>
      </header>

      {logoutError && (
        <p className="admin-status admin-status-error dashboard-logout-error" role="alert">
          {logoutError}
        </p>
      )}

      <nav className="dashboard-tabs" aria-label="Dashboard Navigation">
        <button
          className={`dashboard-tab ${activeTab === "dashboard" ? "dashboard-tab-active" : ""}`}
          type="button"
          aria-current={activeTab === "dashboard" ? "page" : undefined}
          onClick={() => setActiveTab("dashboard")}
        >
          <LayoutDashboard size={17} aria-hidden="true" />
          <span>Dashboard</span>
        </button>
        {isAdmin && (
          <button
            className={`dashboard-tab ${activeTab === "admin" ? "dashboard-tab-active" : ""}`}
            type="button"
            aria-current={activeTab === "admin" ? "page" : undefined}
            onClick={() => setActiveTab("admin")}
          >
            <Shield size={17} aria-hidden="true" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {activeTab === "dashboard" ? (
        <section className="dashboard-content" id="dashboard">
          <h1 className="dashboard-title">
            Welcome, {user.name?.trim() || "there"}
          </h1>

          <article className="dashboard-account-card">
            <div className="dashboard-account-heading">
              <div className="dashboard-avatar" aria-hidden="true">
                {initial}
              </div>
              <div>
                <p className="dashboard-card-eyebrow">Account Details</p>
                {!isEditingProfile && (
                  <h2 className="dashboard-name">{user.name}</h2>
                )}
              </div>
              {!isEditingProfile && (
                <button
                  className="profile-edit-button"
                  type="button"
                  onClick={() => {
                    setProfileName(user.name);
                    setProfileEmail(user.email);
                    setProfileError("");
                    setProfileMessage("");
                    setIsEditingProfile(true);
                  }}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <label className="profile-field">
                  <span>Name</span>
                  <input
                    autoComplete="name"
                    maxLength={40}
                    onChange={(event) => setProfileName(event.target.value)}
                    required
                    value={profileName}
                  />
                </label>
                <label className="profile-field">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    onChange={(event) => setProfileEmail(event.target.value)}
                    required
                    type="email"
                    value={profileEmail}
                  />
                </label>
                {profileError && (
                  <p className="profile-feedback profile-feedback-error" role="alert">
                    {profileError}
                  </p>
                )}
                <div className="profile-edit-actions">
                  <button
                    className="profile-save-button"
                    disabled={profileSaving}
                    type="submit"
                  >
                    <Check size={16} aria-hidden="true" />
                    <span>
                      {profileSaving ? "Updating Profile..." : "Update Profile"}
                    </span>
                  </button>
                  <button
                    className="profile-cancel-button"
                    disabled={profileSaving}
                    onClick={cancelProfileEdit}
                    type="button"
                  >
                    <X size={16} aria-hidden="true" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="dashboard-email">
                <Mail size={18} aria-hidden="true" />
                <span>{user.email}</span>
              </div>
            )}
          </article>

          {profileMessage && (
            <p className="profile-feedback profile-feedback-success" role="status">
              {profileMessage}
            </p>
          )}

        </section>
      ) : (
        <section className="dashboard-content" id="admin">
          <p className="dashboard-eyebrow">Administration</p>
          <h1 className="dashboard-title">Registered Users</h1>

          {usersLoading ? (
            <p className="admin-status" role="status">Loading Users...</p>
          ) : usersError ? (
            <p className="admin-status admin-status-error" role="alert">
              {usersError}
            </p>
          ) : users.length === 0 ? (
            <p className="admin-status">No Registered Users Yet.</p>
          ) : (
            <div className="admin-user-list">
              {users.map((registeredUser) => (
                <article
                  className="admin-user-card"
                  key={registeredUser.email}
                >
                  <div className="admin-user-avatar" aria-hidden="true">
                    {registeredUser.name?.trim().charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="admin-user-details">
                    <h2>{registeredUser.name}</h2>
                    <p>
                      <Mail size={15} aria-hidden="true" />
                      <span>{registeredUser.email}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="admin-activity-section">
            <h2 className="admin-section-title">Login And Logout Activity</h2>
            <p className="admin-activity-description">
              Session times are recorded when users sign in or log out.
            </p>

            {activityLoading ? (
              <p className="admin-status" role="status">
                Loading Activity...
              </p>
            ) : activityError ? (
              <p className="admin-status admin-status-error" role="alert">
                {activityError}
              </p>
            ) : activity.length === 0 ? (
              <p className="admin-status">No Login Activity Yet.</p>
            ) : (
              <div className="admin-activity-table-wrap">
                <table className="admin-activity-table">
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Email</th>
                      <th scope="col">Log In Time</th>
                      <th scope="col">Log Out Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((session) => (
                      <tr key={session.id}>
                        <td>{session.name}</td>
                        <td>{session.email}</td>
                        <td>{formatActivityTime(session.loginAt)}</td>
                        <td>{formatActivityTime(session.logoutAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
