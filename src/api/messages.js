// src/api/messages.js
import axios from 'axios';

const tryGet = async (urls) => {
  for (const u of urls) {
    try {
      const r = await axios.get(u);
      return r.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('GET fallback failed for', u, e?.message);
      // try next URL
    }
  }
  throw new Error('All GET fallbacks failed');
};

const tryPost = async (pairs) => {
  for (const [u, body] of pairs) {
    try {
      const r = await axios.post(u, body);
      return r.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('POST fallback failed for', u, e?.message);
      // try next URL
    }
  }
  throw new Error('All POST fallbacks failed');
};

export const createConversation = async ({ userIds, offerId }) => {
  try {
    return await tryPost([
      ['/api/messages/conversation', { userIds, offerId }],
      ['/api/messages/create', { userIds, offerId }],
      ['/api/messages', { userIds, offerId }],
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('createConversation error:', err);
    return null;
  }
};

export const sendMessage = async ({ conversationId, senderId, content }) => {
  try {
    return await tryPost([
      ['/api/messages/send', { conversationId, senderId, content }],
      ['/api/messages/message', { conversationId, senderId, content }],
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('sendMessage error:', err);
    return null;
  }
};

export const getConversations = async (userId) => {
  try {
    return await tryGet([
      `/api/messages/conversations/${userId}`,
      `/api/messages/conversations?userId=${encodeURIComponent(userId)}`,
      `/api/messages/user/${userId}/conversations`,
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getConversations error:', err);
    return [];
  }
};

export const getMessages = async (conversationId) => {
  try {
    return await tryGet([
      `/api/messages/${conversationId}`,
      `/api/messages/conversation/${conversationId}`,
      `/api/messages/thread/${conversationId}`,
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getMessages error:', err);
    return [];
  }
};

// READ/UNREAD
export const getUnreadCount = async (userId) => {
  try {
    return await tryGet([
      `/api/messages/conversations/${userId}/unread`,
      `/api/messages/unread/${userId}`,
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getUnreadCount error:', err);
    return { count: 0 };
  }
};

export const markMessageRead = async (messageId, userId) => {
  try {
    return await tryPost([
      [`/api/messages/read/${messageId}`, { userId }],
      [`/api/messages/message/${messageId}/read`, { userId }],
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('markMessageRead error:', err);
    return null;
  }
};

export const markThreadRead = async (conversationId, userId) => {
  try {
    return await tryPost([
      [`/api/messages/read-thread/${conversationId}`, { userId }],
      [`/api/messages/conversation/${conversationId}/read`, { userId }],
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('markThreadRead error:', err);
    return null;
  }
};
