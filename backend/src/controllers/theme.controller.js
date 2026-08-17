import Theme from "../models/theme.model.js";

export async function getThemes(req, res, next) {
  try {
    const themes = await Theme.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.status(200).json(themes);
  } catch (error) {
    next(error);
  }
}

export async function createTheme(req, res, next) {
  try {
    const { name, primaryColor, secondaryColor, isDark } = req.body;
    if (!name || !primaryColor) {
      return res.status(400).json({ message: "Theme name and primary color are required" });
    }

    const themeId = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

    const newTheme = await Theme.create({
      themeId,
      name,
      primaryColor,
      secondaryColor: secondaryColor || "#1e293b",
      isDark: isDark !== undefined ? isDark : true,
    });

    res.status(201).json(newTheme);
  } catch (error) {
    next(error);
  }
}

export async function deleteTheme(req, res, next) {
  try {
    const { id } = req.params;
    await Theme.findByIdAndDelete(id);
    res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error) {
    next(error);
  }
}
