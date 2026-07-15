// storage-shim.js
//
// Replaces Claude's built-in window.storage with an equivalent backed by
// our own Neon Postgres database via Vercel API routes. Implements the same
// get/set/delete/list methods with the same Promise-based return shapes, so
// the rest of estimate-pipeline.html's code needs ZERO changes — it was
// already written entirely against this interface.
//
// Load this file BEFORE estimate-pipeline.html's own <script> block runs.

(function () {
  function toJson(response) {
    return response.json();
  }

  window.storage = {
    get: function (key, shared) {
      return fetch('/api/kv?key=' + encodeURIComponent(key))
        .then(toJson)
        .then(function (data) {
          if (!data) return null;
          return { key: data.key, value: data.value, shared: !!shared };
        })
        .catch(function () {
          return null;
        });
    },

    set: function (key, value, shared) {
      return fetch('/api/kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key, value: value }),
      })
        .then(toJson)
        .then(function (data) {
          if (!data || data.error) return null;
          return { key: data.key, value: data.value, shared: !!shared };
        })
        .catch(function () {
          return null;
        });
    },

    delete: function (key, shared) {
      return fetch('/api/kv?key=' + encodeURIComponent(key), { method: 'DELETE' })
        .then(toJson)
        .then(function (data) {
          if (!data || data.error) return null;
          return { key: data.key, deleted: true, shared: !!shared };
        })
        .catch(function () {
          return null;
        });
    },

    list: function (prefix, shared) {
      return fetch('/api/kv-list?prefix=' + encodeURIComponent(prefix || ''))
        .then(toJson)
        .then(function (data) {
          return { keys: (data && data.keys) || [], prefix: prefix, shared: !!shared };
        })
        .catch(function () {
          return null;
        });
    },
  };
})();
