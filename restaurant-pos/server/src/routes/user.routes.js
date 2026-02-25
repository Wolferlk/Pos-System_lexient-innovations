const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", verifyToken, authorizeRoles("admin"), userController.getUsers);
router.put("/:id", verifyToken, authorizeRoles("admin"), userController.updateUser);
router.put("/:id/password", verifyToken, authorizeRoles("admin"), userController.resetPassword);
router.put("/:id/terminate", verifyToken, authorizeRoles("admin"), userController.terminateUser);

module.exports = router;