
import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const blankSnippet = {
  title: '',
  language: 'javascript',
  code: '',
  description: '',
};

export default function SnippetsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankSnippet);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/snippets');
      const data = response.data;
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load snippets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function reset() {
    setForm(blankSnippet);
    setEditingId(null);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId !== null) {
        await api.put(`/snippets/${editingId}`, form);
      } else {
        await api.post('/snippets', form);
      }

      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save snippet.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this snippet?')) return;

    try {
      await api.delete(`/snippets/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete snippet.');
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      setError('Copy failed. Select the code and copy it manually.');
    }
  }

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR CODE LIBRARY</p>
          <h1>Snippets</h1>
          <p className="muted">
            Keep reusable code close at hand.
          </p>
        </div>
        <span className="count-badge">{items.length} saved</span>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="panel">
        <h2>{editingId !== null ? 'Edit snippet' : 'Save a snippet'}</h2>

        <form className="resource-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="snippet-title">Title</label>
            <input
              id="snippet-title"
              name="title"
              value={form.title}
              onChange={change}
              placeholder="e.g. Array filter"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={change}
            >
              <option value="javascript">JavaScript</option>
              <option value="jsx">React / JSX</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="csharp">C#</option>
              <option value="sql">SQL</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={change}
              placeholder="What does this code do?"
            />
          </div>

          <div className="field">
            <label htmlFor="code">Code</label>
            <textarea
              id="code"
              name="code"
              value={form.code}
              onChange={change}
              rows={7}
              placeholder="Paste your code here..."
              className="code-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              className="button button-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingId !== null ? 'Save changes' : 'Add snippet'}
            </button>

            {editingId !== null && (
              <button
                className="button button-outline"
                type="button"
                onClick={reset}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-section">
        <h2>Your saved snippets</h2>

        {loading ? (
          <p className="muted">Loading snippets...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No snippets yet</h3>
            <p className="muted">Save your first reusable piece of code.</p>
          </div>
        ) : (
          <div className="item-grid">
            {items.map((item) => (
              <article className="item-card" key={item.id}>
                <div className="item-card-top">
                  <span className="category-tag">
                    {item.language || 'code'}
                  </span>
                </div>

                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}

                <pre className="code-preview">
                  <code>{item.code}</code>
                </pre>

                <div className="item-actions">
                  <button
                    className="button button-primary button-small"
                    onClick={() => copyCode(item.code || '')}
                  >
                    Copy code
                  </button>

                  <button
                    className="button button-outline button-small"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({
                        title: item.title ?? '',
                        language: item.language ?? 'javascript',
                        code: item.code ?? '',
                        description: item.description ?? '',
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="button button-danger button-small"
                    onClick={() => remove(item.id)}
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
