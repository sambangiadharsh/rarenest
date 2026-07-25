import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { getApiBaseUrl } from '@/shared/config/api';

export default function CustomerSupportWidget() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only configure and load if the user is logged in
    if (!user) {
      // Optional: Clean up config and destroy widget on logout if SDK supports it.
      delete window.ChatWidgetConfig;
      if (window.ChatWidget?.destroy) {
        window.ChatWidget.destroy();
      }
      return;
    }
    
    const chatBackendUrl = import.meta.env.VITE_CHAT_BACKEND_URL;
    const workspaceSlug = import.meta.env.VITE_WORKSPACE_SLUG;

    if (!chatBackendUrl || !workspaceSlug) {
      console.warn(
        'Customer Support Chat Widget configuration is missing.'
      );
      return;
    }

    // 1. Set configuration globally before script loads
    window.ChatWidgetConfig = {
      workspaceSlug,
      apiUrl: `${chatBackendUrl}/api`,
      socketUrl: chatBackendUrl,
      darkMode: false, // Replace with your application's theme if available

      getChatToken: async () => {
        const response = await fetch(
          `${getApiBaseUrl()}/get-support-chat-token`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Unable to retrieve chat token');
        }

        const { token } = await response.json();
        return token;
      },
    };

    // 2. Load the widget script
    const scriptId = 'customer-support-chat-widget-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `${chatBackendUrl}/widget/chat-widget.js`;
      script.async = true;

      script.onerror = () => {
        console.error('Failed to load Customer Support Chat Widget.');
      };

      document.head.appendChild(script);
    }

    // Do NOT remove the script on cleanup.
    // Keep it loaded for the lifetime of the SPA.
    return () => {};
  }, [user]);

  return null;
}