const Employee = require("../models/Employee");
const { logAction } = require("../utils/auditLogger");

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const currentDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const toMonthKey = (dateKey) => String(dateKey || "").slice(0, 7);

const normalizeStatus = (value) => {
  const map = {
    present: "Present",
    absent: "Absent",
    half: "Half",
  };
  return map[String(value || "").toLowerCase()] || "Present";
};

const statusToDays = (status) => {
  if (status === "Present") return 1;
  if (status === "Half") return 0.5;
  return 0;
};

const calcNetSalary = (employee, monthData, workingDays = 30) => {
  const base = Number(employee.basicSalary || 0);
  const days = Number(monthData?.attendanceDays || 0);
  const overtimeHours = Number(monthData?.overtimeHours || 0);
  const allowance = Number(monthData?.allowance || 0);
  const deduction = Number(monthData?.deduction || 0);

  const dailyRate = base / Number(workingDays || 30);
  const hourlyRate = dailyRate / 8;

  const attendancePay = dailyRate * days;
  const overtimePay = hourlyRate * overtimeHours;
  const gross = attendancePay + overtimePay + allowance;
  const net = Math.max(0, Math.round(gross - deduction));

  return {
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(hourlyRate),
    attendancePay: Math.round(attendancePay),
    overtimePay: Math.round(overtimePay),
    allowance,
    deduction,
    gross: Math.round(gross),
    net,
  };
};

const ensureMonthEntry = (employee, monthKey) => {
  if (!Array.isArray(employee.attendanceByMonth)) employee.attendanceByMonth = [];
  let monthEntry = employee.attendanceByMonth.find((m) => m.monthKey === monthKey);
  if (!monthEntry) {
    monthEntry = {
      monthKey,
      attendanceDays: Number(employee.attendanceDays || 0),
      overtimeHours: 0,
      allowance: 0,
      deduction: 0,
      note: "",
      updatedAt: new Date(),
    };
    employee.attendanceByMonth.push(monthEntry);
  }
  return monthEntry;
};

const recomputeMonthAttendance = (employee, monthKey) => {
  const records = Array.isArray(employee.attendanceRecords) ? employee.attendanceRecords : [];
  const monthRecords = records.filter((r) => r.monthKey === monthKey);
  const attendanceDays = monthRecords.reduce((sum, record) => sum + statusToDays(record.status), 0);

  const monthEntry = ensureMonthEntry(employee, monthKey);
  monthEntry.attendanceDays = attendanceDays;
  monthEntry.updatedAt = new Date();
  employee.attendanceDays = attendanceDays;

  return monthEntry;
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({
      name: req.body.name,
      role: req.body.role,
      basicSalary: Number(req.body.basicSalary),
      contactNumber: req.body.contactNumber || "",
      joinedDate: req.body.joinedDate || Date.now(),
      isActive: req.body.isActive !== false,
      attendanceDays: Number(req.body.attendanceDays || 0),
      attendanceByMonth: [
        {
          monthKey: currentMonthKey(),
          attendanceDays: Number(req.body.attendanceDays || 0),
          overtimeHours: 0,
          allowance: 0,
          deduction: 0,
          note: "",
        },
      ],
    });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const month = req.query.month || currentMonthKey();
    const workingDays = Number(req.query.workingDays || 30);
    const employees = await Employee.find().sort({ createdAt: -1 });

    const enriched = employees.map((emp) => {
      const monthData = (emp.attendanceByMonth || []).find((m) => m.monthKey === month) || {
        monthKey: month,
        attendanceDays: Number(emp.attendanceDays || 0),
        overtimeHours: 0,
        allowance: 0,
        deduction: 0,
      };
      const payroll = calcNetSalary(emp, monthData, workingDays);
      return {
        ...emp.toObject(),
        monthData,
        payroll,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee details
exports.updateEmployee = async (req, res) => {
  try {
    const payload = {};
    ["name", "role", "contactNumber", "joinedDate", "isActive"].forEach((k) => {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    });
    if (req.body.basicSalary !== undefined) payload.basicSalary = Number(req.body.basicSalary);

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update monthly attendance/payroll components
exports.updateAttendance = async (req, res) => {
  try {
    const monthKey = req.body.month || currentMonthKey();
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const monthEntry = ensureMonthEntry(employee, monthKey);

    if (req.body.attendanceDays !== undefined) {
      monthEntry.attendanceDays = Math.max(0, Math.min(31, Number(req.body.attendanceDays)));
      employee.attendanceDays = monthEntry.attendanceDays;
    }
    if (req.body.overtimeHours !== undefined) {
      monthEntry.overtimeHours = Math.max(0, Number(req.body.overtimeHours));
    }
    if (req.body.allowance !== undefined) {
      monthEntry.allowance = Math.max(0, Number(req.body.allowance));
    }
    if (req.body.deduction !== undefined) {
      monthEntry.deduction = Math.max(0, Number(req.body.deduction));
    }
    if (req.body.note !== undefined) {
      monthEntry.note = String(req.body.note || "");
    }
    monthEntry.updatedAt = new Date();

    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Monthly payroll report
exports.getMonthlyPayroll = async (req, res) => {
  try {
    const month = req.query.month || currentMonthKey();
    const workingDays = Number(req.query.workingDays || 30);

    const employees = await Employee.find().sort({ name: 1 });
    const rows = employees.map((emp) => {
      const monthData = (emp.attendanceByMonth || []).find((m) => m.monthKey === month) || {
        monthKey: month,
        attendanceDays: Number(emp.attendanceDays || 0),
        overtimeHours: 0,
        allowance: 0,
        deduction: 0,
      };
      const payroll = calcNetSalary(emp, monthData, workingDays);
      return {
        employeeId: emp._id,
        name: emp.name,
        role: emp.role,
        basicSalary: emp.basicSalary,
        monthData,
        payroll,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.netSalary += r.payroll.net;
        acc.grossSalary += r.payroll.gross;
        acc.attendancePay += r.payroll.attendancePay;
        acc.overtimePay += r.payroll.overtimePay;
        acc.allowance += Number(r.monthData.allowance || 0);
        acc.deduction += Number(r.monthData.deduction || 0);
        return acc;
      },
      { netSalary: 0, grossSalary: 0, attendancePay: 0, overtimePay: 0, allowance: 0, deduction: 0 }
    );

    res.json({ month, workingDays, totalEmployees: rows.length, totals, rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cashier/Admin: mark attendance for a day
exports.markDailyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const dateKey = req.body.date || currentDateKey();
    const monthKey = toMonthKey(dateKey);
    const status = normalizeStatus(req.body.status);
    const note = req.body.note ? String(req.body.note) : "";

    if (!Array.isArray(employee.attendanceRecords)) employee.attendanceRecords = [];
    let record = employee.attendanceRecords.find((r) => r.dateKey === dateKey);
    if (!record) {
      record = {
        dateKey,
        monthKey,
        status,
        note,
        markedBy: req.user?.id || null,
        markedAt: new Date(),
      };
      employee.attendanceRecords.push(record);
    } else {
      record.monthKey = monthKey;
      record.status = status;
      record.note = note;
      record.markedBy = req.user?.id || null;
      record.markedAt = new Date();
    }

    const monthData = recomputeMonthAttendance(employee, monthKey);
    await employee.save();

    await logAction({
      req,
      action: "MARK_ATTENDANCE",
      task: "Mark attendance",
      module: "Employees",
      description: `${employee.name} marked ${status} on ${dateKey}`,
      entityType: "Employee",
      entityId: employee._id,
      payload: { dateKey, monthKey, status },
    });

    res.json({
      message: "Attendance marked",
      employee,
      monthData,
      record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: edit attendance for a specific day
exports.updateDailyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const dateKey = req.body.date;
    if (!dateKey) return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });

    const monthKey = toMonthKey(dateKey);
    const status = normalizeStatus(req.body.status);
    const note = req.body.note !== undefined ? String(req.body.note || "") : undefined;

    if (!Array.isArray(employee.attendanceRecords)) employee.attendanceRecords = [];
    let record = employee.attendanceRecords.find((r) => r.dateKey === dateKey);
    if (!record) {
      record = {
        dateKey,
        monthKey,
        status,
        note: note || "",
        markedBy: req.user?.id || null,
        markedAt: new Date(),
      };
      employee.attendanceRecords.push(record);
    } else {
      record.monthKey = monthKey;
      record.status = status;
      if (note !== undefined) record.note = note;
      record.markedBy = req.user?.id || null;
      record.markedAt = new Date();
    }

    const monthData = recomputeMonthAttendance(employee, monthKey);
    await employee.save();

    await logAction({
      req,
      action: "EDIT_ATTENDANCE",
      task: "Edit attendance",
      module: "Employees",
      description: `${employee.name} attendance edited for ${dateKey} (${status})`,
      entityType: "Employee",
      entityId: employee._id,
      payload: { dateKey, monthKey, status },
    });

    res.json({
      message: "Attendance updated",
      employee,
      monthData,
      record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: attendance analysis for selected month
exports.getAttendanceSummary = async (req, res) => {
  try {
    const month = req.query.month || currentMonthKey();
    const workingDays = Number(req.query.workingDays || 30);
    const employees = await Employee.find().sort({ name: 1 });

    const rows = employees.map((emp) => {
      const monthData = (emp.attendanceByMonth || []).find((m) => m.monthKey === month) || {
        monthKey: month,
        attendanceDays: 0,
        overtimeHours: 0,
        allowance: 0,
        deduction: 0,
      };
      const monthRecords = (emp.attendanceRecords || []).filter((r) => r.monthKey === month);
      const presentCount = monthRecords.filter((r) => r.status === "Present").length;
      const halfCount = monthRecords.filter((r) => r.status === "Half").length;
      const absentCount = monthRecords.filter((r) => r.status === "Absent").length;
      const attendanceDays = Number(monthData.attendanceDays || 0);
      const attendanceRate = workingDays > 0 ? Number(((attendanceDays / workingDays) * 100).toFixed(1)) : 0;
      const payroll = calcNetSalary(emp, monthData, workingDays);

      return {
        employeeId: emp._id,
        name: emp.name,
        role: emp.role,
        attendanceDays,
        presentCount,
        halfCount,
        absentCount,
        attendanceRate,
        overtimeHours: Number(monthData.overtimeHours || 0),
        allowance: Number(monthData.allowance || 0),
        deduction: Number(monthData.deduction || 0),
        payroll,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.totalEmployees += 1;
        acc.attendanceDays += row.attendanceDays;
        acc.presentCount += row.presentCount;
        acc.halfCount += row.halfCount;
        acc.absentCount += row.absentCount;
        acc.overtimeHours += row.overtimeHours;
        acc.netSalary += Number(row.payroll?.net || 0);
        return acc;
      },
      {
        totalEmployees: 0,
        attendanceDays: 0,
        presentCount: 0,
        halfCount: 0,
        absentCount: 0,
        overtimeHours: 0,
        netSalary: 0,
      }
    );

    totals.avgAttendanceRate =
      rows.length > 0 ? Number((rows.reduce((s, r) => s + r.attendanceRate, 0) / rows.length).toFixed(1)) : 0;

    res.json({
      month,
      workingDays,
      totals,
      rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
