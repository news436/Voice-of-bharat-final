import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ContactUsPage: React.FC = () => {
  const [contact, setContact] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      const { data } = await supabase.from('contact_us').select('*').limit(1).single();
      setContact(data);
      setLoading(false);
    };
    fetchContact();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optionally, store inquiries in a table
    await supabase.from('contact_inquiries').insert([{ ...form }]);
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      {contact && (
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Contact Details</h2>
          <p><strong>Address:</strong> {contact.address}</p>
          <p><strong>Email:</strong> <a href={`mailto:${contact.email}`} className="text-blue-600">{contact.email}</a></p>
          <p><strong>Phone:</strong> <a href={`tel:${contact.phone}`} className="text-blue-600">{contact.phone}</a></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-black p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold mb-2">Send us a message</h2>
        {submitted && <div className="text-green-600 mb-2">Thank you for your message!</div>}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="w-full p-2 border rounded"
          rows={5}
          required
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Send</button>
      </form>
    </div>
  );
};

export default ContactUsPage; 