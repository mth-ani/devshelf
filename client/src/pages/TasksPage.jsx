
import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const blankTask = {
  title: '',
  description: '',
  isCompleted: false,
};

export default function TasksPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/tasks');
      const data = response.data;
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setForm(blankTask);
    setEditingId(null);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId !== null) {
        await api.put(`/tasks/${editingId}`, form);
      } else {
        await api.post('/tasks', form);
      }

      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save task.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    const updated = {
      title: task.title,
      description: task.description ?? '',
      isCompleted: !(task.isCompleted ?? task.completed ?? false),
    };

    try {
      await api.put(`/tasks/${task.id}`, updated);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update task.');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete task.');
    }
  }

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PLAN YOUR PROGRESS</p>
          <h1>Tasks</h1>
          <p className="muted">
            Track the development work you want to complete.
          </p>
        </div>
        <span className="count-badge">{items.length} total</span>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="panel">
        <h2>{editingId !== null ? 'Edit task' : 'Create a task'}</h2>

        <form className="resource-form" onSubmit={async (event) => {
          await submit(event);
        }}>
          <div className="field">
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Finish Resources page"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details (optional)"
            />
          </div>

          <div className="form-actions">
            <button className="button button-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId !== null ? 'Save changes' : 'Add task'}
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
        <h2>Your tasks</h2>

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing on your list yet</h3>
            <p className="muted">Add a task to get started.</p>
          </div>
        ) : (
          <div className="task-list">
            {items.map((task) => {
              const completed = task.isCompleted ?? task.completed ?? false;

              return (
                <article className="task-card" key={task.id}>
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={Boolean(completed)}
                      onChange={() => toggleTask(task)}
                    />
                    <span className={completed ? 'task-completed' : ''}>
                      {task.title}
                    </span>
                  </label>

                  {task.description && <p>{task.description}</p>}

                  <div className="item-actions">
                    <button
                      className="button button-outline button-small"
                      onClick={() => {
                        setEditingId(task.id);
                        setForm({
                          title: task.title ?? '',
                          description: task.description ?? '',
                          isCompleted: Boolean(completed),
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="button button-danger button-small"
                      onClick={() => remove(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
