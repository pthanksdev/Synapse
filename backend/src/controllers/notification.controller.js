export async function subscribeToPush(req, res, next) {
  try {
    // To be implemented: Save Web Push subscription object to user profile
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
}

export async function unsubscribeFromPush(req, res, next) {
  try {
    // To be implemented: Remove Web Push subscription object
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
}
