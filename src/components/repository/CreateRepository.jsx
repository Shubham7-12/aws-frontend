import React, { useState } from "react";
import axios from "axios";

const CreateRepository = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please log in before creating a repository.");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                "http://13.60.71.205:3000/repo/create",
                {
                    name,
                    description,
                    visibility,
                    content: [],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            window.location.href = "/";
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to create repository."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create a repository</h2>

            {error && <p role="alert">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="repo-name">Repository name</label>
                    <input
                        id="repo-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="repo-description">Description</label>
                    <textarea
                        id="repo-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="repo-visibility">Visibility</label>
                    <select
                        id="repo-visibility"
                        value={String(visibility)}
                        onChange={(e) =>
                            setVisibility(e.target.value === "true")
                        }
                    >
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create repository"}
                </button>
            </form>
        </div>
    );
};

export default CreateRepository;