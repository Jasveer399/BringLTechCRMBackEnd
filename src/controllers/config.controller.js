import { Config } from "./../model/config.model.js";

const employeeRole = async (req, res) => {
  console.log(req.body);
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
      success: true,
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
      .json({ 
        allRoles: config.options.map((option) => option.value),
        data: config.options
      });
  } catch (error) {
    console.error("Error in getAllRoles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRole = async (req, res) => {
  const { role } = req.body;

  try {
    const config = await Config.findOne();
    if (!config) {
      return res
        .status(404)
        .json({ message: "No roles found", success: false });
    }

    const filteredRoles = config.options.filter((option) => option.value !== role)

    config.options = filteredRoles
    await config.save()

    return res.status(200).json({
        data: config.options,
        message: "Role deleted successfully !!",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Error while deleting role",
      success: false,
    });
  }
};

const editRole = async(req, res) => {
  const { role, editRole } = req.body

  try {
    const config = await Config.findOne();
    if (!config) {
      return res
        .status(404)
        .json({ message: "No roles found", success: false });
    }
    const filteredRoles = config.options.filter((option) => 
      option._id == role._id ? option.value = editRole : option
    )

    config.options = filteredRoles
    await config.save()

    return res.status(200).json({
      data: filteredRoles,
      message: "Role Edited Successfully !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while editing role",
      success: false,
    });
  }
}

export { employeeRole, getAllrole, deleteRole, editRole };
