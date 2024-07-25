import { createEmployee, getAllEmployee, getEmployeeData, getSpecificEmployeeTasks, loginEmployee, logoutEmployee, updatePassword } from "../controllers/employee.controller.js";
import { Router} from "express";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import nodemailer from "nodemailer";

const router = Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee)
router.post("/updatepassword",verifyJWT(['employee']),updatePassword),
router.get("/logout", verifyJWT(['employee']), logoutEmployee)
router.get("/getAllEmployee", getAllEmployee)
router.post("/getEmployeeData", verifyJWT(['admin']), getEmployeeData)
router.post("/getSpecificEmployeeTasks", verifyJWT(['admin']), getSpecificEmployeeTasks)
router.post("/login", loginEmployee);
router.post("/updatepassword", verifyJWT(["employee"]), updatePassword),
  router.get("/logout", verifyJWT(["employee"]), logoutEmployee);
router.get("/getAllEmployee", getAllEmployee);
router.post("/getEmployeeData", verifyJWT(["admin"]), getEmployeeData);

router.post("/mail", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.NODE_MAILER_EMAIL,
          pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL,
        to: email,
        subject: "Realtime Support",
        text: "One of your customers on Corinna, just switched to realtime mode",
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);
      res.status(200).json({ message: "Email sent successfully", success: true, info });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error sending email", success: false, error: error.message });
    }
  });

export default router;
