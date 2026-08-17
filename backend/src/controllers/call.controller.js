export async function getIceServers(req, res, next) {
  try {
    // To be implemented: Fetch TURN/STUN credentials (e.g., from Twilio or Metered)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
}

export async function logCallHistory(req, res, next) {
  try {
    // To be implemented: Save metadata for a completed call (duration, participants)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
}
