self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.url || "/pomodoro";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const matchingClient = windowClients.find(
          (client) => new URL(client.url).pathname === targetPath,
        );

        if (matchingClient) {
          return matchingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
