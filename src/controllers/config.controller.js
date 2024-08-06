import { Config } from "./../model/config.model.js";
const employeeRole = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input. Roles should be a non-empty array." });
    }
    let config = await Config.findOne();

    if (!config) {
      config = new Config({ options: [] });
    }

    const newRoles = roles.filter(
      (role) =>
        !config.options.some(
          (option) => option.value.toLowerCase() === role.toLowerCase()
        )
    );

    config.options.push(...newRoles.map((role) => ({ value: role })));

    await config.save();

    res.status(200).json({
      message: "Roles updated successfully",
      addedRoles: newRoles,
      allRoles: config.options.map((option) => option.value),
    });
  } catch (error) {
    console.error("Error in employeeRole:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllrole = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "No roles found" });
    }
    res
      .status(200)
      .json({ allRoles: config.options.map((option) => option.value) });
  } catch (error) {
    console.error("Error in getAllRoles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { employeeRole,getAllrole };
