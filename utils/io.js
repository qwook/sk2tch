import io from "socket.io-client";

// lol
export default io;
export const socket = io({
  reconnection: true, // Enable automatic reconnection
  reconnectionAttempts: Infinity, // Retry indefinitely
  reconnectionDelay: 1000, // Initial delay before reconnecting (in ms)
  reconnectionDelayMax: 5000, // Maximum delay between reconnections (in ms)
  timeout: 20000, // Connection timeout (in ms)
});
