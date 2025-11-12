import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useMessages } from "../../../hooks/useMessages";
import MessageItem from "../../../components/messages/MessageItem";

const ClientInbox = () => {
  const { authUser } = useAuth();
  const { messages, loading, error } = useMessages(authUser?._id);
  const list = Array.isArray(messages) ? messages : [];

  return (
    <section className="p-6 space-y-4" aria-labelledby="client-inbox-heading">
      <h1 id="client-inbox-heading" className="text-2xl font-semibold mb-4">
        📨 Wiadomości — Klient
      </h1>

      {loading && (
        <p className="text-gray-500" role="status" aria-busy="true">
          Ładowanie wiadomości...
        </p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p className="text-gray-500">Brak wiadomości.</p>
      )}

      {list.map((msg) => (
        <MessageItem key={msg._id} message={msg} />
      ))}
    </section>
  );
};

export default ClientInbox;
