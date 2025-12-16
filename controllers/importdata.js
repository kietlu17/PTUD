const {
  importHocSinhFromKetQua,
} = require("../services/importHocSinhFromKetQua.service");

exports.importHocSinh = async (req, res) => {
  try {
    const result = await importHocSinhFromKetQua();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
