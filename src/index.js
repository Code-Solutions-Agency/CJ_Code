import { handleChatRequest } from "./chat.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      return handleChatRequest(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};
