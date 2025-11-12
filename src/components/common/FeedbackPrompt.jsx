import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const FeedbackPrompt = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Suggestion');
  const [text, setText] = useState('');

  const submitFeedback = async () => {
    if (!text) return toast.error("Wpisz treść uwagi");
    await axios.post('/api/feedback', { type, text, page: window.location.pathname });
    toast.success("Dziękujemy za Twoją opinię!");
    setText('');
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="bg-white shadow-lg border p-4 rounded w-72 space-y-2">
          <div className="flex justify-between items-center font-bold">💬 Feedback</div>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border p-1 rounded">
            <option>Suggestion</option>
            <option>Bug</option>
            <option>Other</option>
          </select>
          <textarea
            rows="3"
            placeholder="Opisz sugestię lub problem..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full border rounded p-1"
          />
          <div className="flex justify-between text-sm">
            <button onClick={() => setOpen(false)} className="text-gray-500">Anuluj</button>
            <button onClick={submitFeedback} className="bg-blue-600 text-white px-2 py-1 rounded">Wyślij</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg">
          💬 Feedback
        </button>
      )}
    </div>
  );
};

export default FeedbackPrompt;
