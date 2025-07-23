import { useState } from 'react';
import { withSessionSsr } from '../../lib/session';
import { useRouter } from 'next/router';

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  if (!req.session.user?.authenticated) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  const fs = require('fs');
  const path = require('path');
  const file = path.join(process.cwd(), 'backends.json');
  const backends = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
  return { props: { backends } };
});

export default function AdminDashboard({ backends: initialData }) {
  const [backends, setBackends] = useState(initialData);
  const [form, setForm] = useState({ name: '', url: '', logo: '' });
  const router = useRouter();

  const refresh = async () => {
    const res = await fetch('/api/backends');
    if (res.ok) {
      setBackends(await res.json());
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/backends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: '', url: '', logo: '' });
      refresh();
    }
  };

  const handleRemove = async (name) => {
    await fetch('/api/backends', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    refresh();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>

      <table className="w-full mb-6 bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">URL</th>
            <th className="p-2">Clicks</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {backends.map((b) => (
            <tr key={b.name} className="border-t border-gray-200 dark:border-gray-700">
              <td className="p-2 dark:text-white">{b.name}</td>
              <td className="p-2"><a href={b.url} className="text-blue-500">{b.url}</a></td>
              <td className="p-2 dark:text-white">{b.clicks || 0}</td>
              <td className="p-2">
                <button
                  onClick={() => handleRemove(b.name)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Add Backend</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="url"
          placeholder="URL"
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <input
          type="text"
          placeholder="Logo path (optional)"
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
          value={form.logo}
          onChange={(e) => setForm({ ...form, logo: e.target.value })}
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
    </div>
  );
} 