// import Admin from "../model/admin.model.js";

import { Admin } from "../model/admin.model.js";

const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const admin = await Admin.create({
      username,
      email,
      password,
    });

    return res.status(201).json({admin: admin});
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export { createAdmin };
