import { Project } from "../model/project.model.js";

const createProject = async (req, res) => {
  const { name, description, link, startDate, endDate, technologies } =
    req.body;

  console.log(req.body);

  if (!name && !description && !startDate && !technologies) {
    return res.status(400).json({
      messaage: "All fields are required !!",
      success: false,
    });
  }
  try {
    const project = await Project.create({
      name,
      description,
      link,
      startDate,
      endDate,
      technologies,
    });

    if (!project) {
      return res.status(500).json({
        messaage: "Something went wrong while creating project",
        success: false,
      });
    }

    return res.status(200).json({
      data: project,
      messaage: "Project Created !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while creating project !!",
      success: false,
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({});

    if (!projects) {
      return res.status(500).json({
        messaage: "Projects not found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: projects,
      messaage: "Projects Fetched !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while fetching projects !!",
      success: false,
    });
  }
};

const deleteProject = async (req, res) => {
  const { _id } = req.body;

  try {
    const project = await Project.findByIdAndDelete({ _id });

    if (!project) {
      return res.status(500).json({
        messaage: "Projects not found !!",
        success: false,
      });
    }
    return res.status(200).json({
      messaage: "Projects deleted !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while deleting project !!",
      success: false,
    });
  }
};

const addTeamMembers = async (req, res) => {
  const { team, _id } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      _id,
      {
        $set: {
          team: team,
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(500).json({
        messaage: "Project not found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: project,
      messaage: "Team members added !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "error while adding members to the project !!",
      success: false,
    });
  }
};

const editProject = async (req, res) => {
  const { name, description, link, startDate, endDate, technologies, _id } =
    req.body;

  if (!name && !description && !startDate && !technologies) {
    return res.status(400).json({
      messaage: "All fields are required !!",
      success: false,
    });
  }

  try {
    const editedProject = await Project.findByIdAndUpdate(
      _id,
      {
        name,
        description,
        link,
        startDate,
        endDate,
        technologies,
      },
      { new: true }
    );

    if (!editedProject) {
      return res.status(500).json({
        messaage: "Project not found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: editedProject,
      messaage: "Project edited !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while editing project !!",
      success: false,
    });
  }
};

const statusHandler = async(req, res) => {
  const { status, _id } = req.body

  try {
    const statusChanged = await Project.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: status
        }
      },
      { new: true }
    )

    if (!statusChanged) {
      return res.status(500).json({
        messaage: "Project not found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: statusChanged,
      messaage: "Status Updated !!",
      success: true,
    });
    
  } catch (error) {
    return res.status(500).json({
      messaage: "error while changing status !!",
      success: false,
    });
  }
}

export {
  createProject,
  getAllProjects,
  deleteProject,
  addTeamMembers,
  editProject,
  statusHandler
};

// Get a single project by ID
export async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.id).populate(
      "team",
      "name email"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a project
export async function updateProject(req, res) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Add a team member to a project
// export async function addTeamMember(req, res) {
//   try {
//     const project = await Project.findById(req.params.id);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     const { employeeId } = req.body;
//     if (!project.team.includes(employeeId)) {
//       project.team.push(employeeId);
//       await project.save();
//     }
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// }

// Remove a team member from a project
export async function removeTeamMember(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { employeeId } = req.body;
    project.team = project.team.filter((id) => id.toString() !== employeeId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
