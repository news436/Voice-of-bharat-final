import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const ContactUsManager: React.FC = () => {
  const [contact, setContact] = useState<any>({ address: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      const { data } = await supabase.from('contact_us').select('*').limit(1).single();
      if (data) setContact(data);
      setLoading(false);
    };
    fetchContact();
    // Fetch inquiries
    const fetchInquiries = async () => {
      const { data } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(data || []);
      setInquiriesLoading(false);
    };
    fetchInquiries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    if (contact.id) {
      await supabase.from('contact_us').update(contact).eq('id', contact.id);
    } else {
      const { data } = await supabase.from('contact_us').insert([contact]).select('*').single();
      setContact(data);
    }
    setSaving(false);
    setSuccess(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-black rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Manage Contact Us Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <textarea
              name="address"
              value={contact.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={contact.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          {success && <div className="text-green-600 mt-2">Contact details updated!</div>}
        </form>
      </div>
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-black rounded shadow">
        <h2 className="text-2xl font-bold mb-4">User Inquiries</h2>
        {inquiriesLoading ? (
          <div>Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-gray-500">No inquiries yet.</div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="border rounded p-4 bg-gray-50 dark:bg-gray-900">
                <div className="font-semibold">{inq.name} &lt;{inq.email}&gt;</div>
                <div className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{inq.message}</div>
                <div className="text-xs text-gray-500 mt-2">{new Date(inq.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}; 