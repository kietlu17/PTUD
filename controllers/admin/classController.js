const { sequelize, HocSinh, Lop, ToHopMon } = require('../../models');
const { Op } = require('sequelize');

/**
 * POST /admin/create-classes
 * body: {
 *   year: 2025,
 *   numClasses: 10,
 *   classPrefix: '10A',
 *   maxSize: 45
 * }
 * => Luôn tạo lớp khối 10 (khoi = 10)
 */
exports.createClasses = async (req, res) => {
    console.log(req.body)
  const {
    grade,          // chỉ tạo lớp cho khối 10
    year,                // năm nhập học
    numClasses,
    classPrefix = `${grade}A`,
    maxSize = 45
  } = req.body;

  if (!year || !numClasses) {
    return res.status(400).json({ error: 'Thiếu param year hoặc numClasses' });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Lấy tất cả HS khối 10 đã chọn tổ hợp môn
    const students = await HocSinh.findAll({
      where: {
        NamNhapHoc: year,
        id_tohopmon: { [Op.ne]: null }
      },
      include: [{ model: ToHopMon, as: 'tohopmon' }],
      transaction: t
    });

    if (students.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Không có học sinh đã chọn tổ hợp' });
    }

    // 2. Gom học sinh theo id_tohopmon
    const groups = {};
    students.forEach(s => {
      const key = String(s.id_tohopmon);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    // 3. Tính số lớp cần thiết cho từng tổ hợp
    const groupStats = Object.keys(groups).map(id_tohopmon => {
      const list = groups[id_tohopmon];
      return { id_tohopmon, count: list.length, initial: Math.ceil(list.length / maxSize) || 0 };
    });

    // 4. Phân bổ số lớp theo tổng numClasses
    let totalInitial = groupStats.reduce((s, g) => s + g.initial, 0);
    if (totalInitial <= numClasses) {
      // có dư lớp -> phân bổ thêm
      let remaining = numClasses - totalInitial;
      groupStats.forEach(g => g.assignedClasses = g.initial || 0);
      groupStats.sort((a, b) => b.count - a.count);
      while (remaining > 0) {
        groupStats[0].assignedClasses++;
        remaining--;
        groupStats.sort((a, b) => b.count / b.assignedClasses - a.count / a.assignedClasses);
      }
    } else {
      // tổng initial > numClasses -> giảm bằng cách tỉ lệ
      const totalStudents = students.length;
      let rem = numClasses;
      groupStats.forEach((g, idx) => {
        if (idx === groupStats.length - 1) g.assignedClasses = rem;
        else {
          const a = Math.max(1, Math.round((g.count / totalStudents) * numClasses));
          g.assignedClasses = a;
          rem -= a;
        }
      });
    }

    // 5. Tạo lớp và gán học sinh
    const createdClasses = [];
    let classIndex = 1;
    for (const g of groupStats) {
      const list = groups[g.id_tohopmon] || [];
      const k = g.assignedClasses || 0;
      if (k === 0) continue;

      const baseSize = Math.floor(list.length / k);
      let extra = list.length % k;
      let offset = 0;

      for (let i = 0; i < k; i++) {
        const size = baseSize + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;

        const className = `${classPrefix}${String(classIndex).padStart(2, '0')}`;
        const newLop = await Lop.create({
          TenLop: className,
          id_ToHopMon: g.id_tohopmon,
          nam_nhap_hoc: year
        }, { transaction: t });

        const assigned = list.slice(offset, offset + size);
        offset += size;

        // Cập nhật học sinh vào lớp
        const studentIds = assigned.map(s => s.id);
        if (studentIds.length > 0) {
          await HocSinh.update(
            { id_Lop: newLop.id },
            { where: { id: studentIds }, transaction: t }
          );
        }

          // Lấy tên tổ hợp
          const toHopName = list[0]?.tohopmon?.TenToHop || null;

          // Đếm Nam – Nữ
          let male = 0, female = 0;
          assigned.forEach(s => {
            if (s.GioiTinh === "Nam") male++;
            else if (s.GioiTinh === "Nu") female++;
          });

          // Push dữ liệu
          createdClasses.push({
            lopId: newLop.id,
            TenLop: className,
            id_ToHopMon: g.id_tohopmon,
            toHopName,
            size: studentIds.length,
            male,
            female,
            studentIds
          });


        classIndex++;
      }
    }

    // 6. Tạo thêm lớp trống nếu còn thiếu để đạt numClasses
    while (createdClasses.length < numClasses) {
      const className = `${classPrefix}${String(classIndex).padStart(2, '0')}`;
      const newLop = await Lop.create({
        TenLop: className,
        khoi: grade,
        id_tohopmon: null,
        nam_nhap_hoc: year
      }, { transaction: t });

        createdClasses.push({
          lopId: newLop.id,
          TenLop: className,
          id_tohopmon: null,
          toHopName: null,
          size: 0,
          male: 0,
          female: 0,
          studentIds: []
        });


      classIndex++;
    }

    await t.commit();

    return res.render('./admin/taolop/result', {
      classes: createdClasses,
      students,
      totalStudents: students.length,
      totalClasses: createdClasses.length
    });


  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.preview = async (req, res) => {
  const { year, numClasses, classPrefix, maxSize } = req.body;

  const grade = 10; // luôn là khối 10

  // --- lấy dữ liệu tương tự createClasses ---
  const students = await HocSinh.findAll({
    where: {
      NamNhapHoc: year,
      id_tohopmon: { [Op.ne]: null }
    },
    include: [{ model: ToHopMon, as: "tohopmon" }]
  });

  const groups = {};classPrefix
  students.forEach(s => {
    const key = String(s.id_tohopmon);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const groupStats = Object.keys(groups).map(id => ({
    id_to_hop: id,
    toHopName: groups[id][0].tohopmon.TenToHop,
    count: groups[id].length,
    assignedClasses: Math.ceil(groups[id].length / 45) // gợi ý 1 lớp ~ max 45 HS
  }));

  res.render("./admin/taolop/preview", {
    grade,
    year,
    numClasses,
    classPrefix,
    totalStudents: students.length,
    groups: groupStats
  });
};

exports.showCreateForm = (req, res) => {
  res.render('admin/taolop/create'); // form nhập số lớp, năm, prefix
};

// exports.previewClasses = async (req, res) => {
//   // gọi hàm xử lý preview
//   const result = await this.preview(req.body);
//   res.render('admin/taolop/preview', result);
// };

// exports.confirmCreate = async (req, res) => {
//   const result = await this.createClasses(req.body);
//   res.json(result);
// };
