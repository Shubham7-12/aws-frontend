import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const RepositoryDetails = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [visibilityError, setVisibilityError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const handleToggleVisibility = async () => {
    const newVisibility = !repository.visibility;
    const action = newVisibility ? "public" : "private";

    const confirmed = window.confirm(
      `Are you sure you want to make this repository ${action}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setTogglingVisibility(true);
      setVisibilityError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to change repository visibility.");
      }

      const response = await fetch(`http://localhost:3000/repo/toggle/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to change visibility.",
        );
      }

      setRepository((prev) => ({
        ...prev,
        ...data,
        visibility:
          typeof data.visibility === "boolean"
            ? data.visibility
            : newVisibility,
      }));
    } catch (err) {
      setVisibilityError(
        err.message || "Failed to change repository visibility.",
      );
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setEditError("Please log in to update this repository.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`http://localhost:3000/repo/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to update description.",
        );
      }

      setRepository((prev) => ({
        ...prev,
        ...data,
        description: data.description ?? editDescription,
      }));

      setEditing(false);
      setEditSuccess("Repository description updated successfully.");
    } catch (err) {
      setEditError(err.message || "Failed to update description.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${repository.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to delete this repository.");
      }

      const response = await fetch(`http://localhost:3000/repo/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to delete repository.",
        );
      }

      window.location.href = "/";
    } catch (err) {
      setDeleteError(err.message || "Failed to delete repository.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:3000/repo/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Failed to load repository.",
          );
        }

        setRepository(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  if (loading) {
    return <p>Loading repository...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  if (!repository) {
    return <p>Repository not found.</p>;
  }

  return (
    <div>
      <Link to="/">← Back to dashboard</Link>

      <h1>{repository.name}</h1>
      <p>{repository.description || "No description provided."}</p>

      {repository.owner?._id === localStorage.getItem("userId") && (
        <button
          onClick={() => {
            setEditDescription(repository.description || "");
            setEditError("");
            setEditSuccess("");
            setEditing(!editing);
          }}
        >
          {editing ? "Cancel Edit" : "Edit Description"}
        </button>
      )}

      {editing && (
        <form onSubmit={handleUpdateDescription}>
          <label htmlFor="edit-description">Repository description</label>

          <textarea
            id="edit-description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Description"}
          </button>
        </form>
      )}

      {editError && <p role="alert">{editError}</p>}
      {editSuccess && <p role="status">{editSuccess}</p>}

      {deleteError && <p role="alert">{deleteError}</p>}

      {repository.owner?._id === localStorage.getItem("userId") && (
        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete Repository"}
        </button>
      )}

      <p>Visibility: {repository.visibility ? "Public" : "Private"}</p>

      {repository.owner?._id === localStorage.getItem("userId") && (
        <button onClick={handleToggleVisibility} disabled={togglingVisibility}>
          {togglingVisibility
            ? "Updating..."
            : repository.visibility
              ? "Make Private"
              : "Make Public"}
        </button>
      )}

      {visibilityError && <p role="alert">{visibilityError}</p>}

      <h2>Repository Content</h2>

      {Array.isArray(repository.content) && repository.content.length > 0 ? (
        <ul>
          {repository.content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No content yet.</p>
      )}
    </div>
  );
};

export default RepositoryDetails;
