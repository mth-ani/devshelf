
import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const emptyForm = {
  title: '',
  url: '',
  notes: '',
  type: 'docs',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/resources');
      const data = response.data;
      setResources(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not load resources. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function startEditing(resource) {
    setEditingId(resource.id);
    setForm({
      title: resource.title ?? '',
      url: resource.url ?? '',
      notes: resource.notes ?? '',
      type: resource.type ?? 'docs',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId !== null) {
        await api.put(`/resources/${editingId}`, form);
      } else {
        await api.post('/resources', form);
      }

      resetForm();
      await loadResources();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not save this resource.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id) {
    if (!window.confirm('Delete this resource?')) return;

    try {
      await api.delete(`/resources/${id}`);
      await loadResources();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not delete this resource.'
      );
    }
  }

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR KNOWLEDGE BASE</p>
          <h1>Resources</h1>
          <p className="muted">
            Save documentation, tutorials, tools, and useful links.
          </p>
        </div>

        <span className="count-badge">
          {resources.length} saved
        </span>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="panel">
        <h2>{editingId !== null ? 'Edit resource' : 'Add a resource'}</h2>

        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. React documentation"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="url">URL</label>
            <input
              id="url"
              name="url"
              type="url"
              value={form.url}
              onChange={updateField}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="type">Category</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={updateField}
            >
              <option value="docs">Documentation</option>
              <option value="tutorial">Tutorial</option>
              <option value="tool">Tool</option>
              <option value="article">Article</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={updateField}
              placeholder="What is useful about this resource?"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Save changes'
                  : 'Add resource'}
            </button>

            {editingId !== null && (
              <button
                className="button button-outline"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Your saved resources</h2>
          <button
            className="button button-outline button-small"
            onClick={loadResources}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">↗</span>
            <h3>No resources yet</h3>
            <p className="muted">
              Add your first useful link using the form above.
            </p>
          </div>
        ) : (
          <div className="item-grid">
            {resources.map((resource) => (
              <article className="item-card" key={resource.id}>
                <div className="item-card-top">
                  <span className="category-tag">
                    {resource.type || 'resource'}
                  </span>
                  <span className="item-id">#{resource.id}</span>
                </div>

                <h3>{resource.title}</h3>
                {resource.notes && <p>{resource.notes}</p>}

                <a
                  className="resource-link"
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit resource ↗
                </a>

                <div className="item-actions">
                  <button
                    className="button button-outline button-small"
                    onClick={() => startEditing(resource)}
                  >
                    Edit
                  </button>
                  <button
                    className="button button-danger button-small"
                    onClick={() => deleteResource(resource.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
