const { ThanhToanHocPhi , PhuHuynh, HocSinh } = require('../models');

// Hàm hiển thị danh sách công nợ theo kỳ/năm học
async function showPaymentDashboard(req, res) {
    const { user } = req.session;

    // 1. Tiền điều kiện: Kiểm tra đăng nhập
    if (!user || user.role !== 'phụ huynh') {
        return res.redirect('/login');
    }
    
    // Lấy id_HocSinh từ session (đã lưu ở bước đăng nhập)
    // const hocSinhId = user.hocSinhId; 
    //  SỬA LỖI: Không dựa vào hocSinhId từ session nữa
    const username = user.username;

    try {
        // if (!hocSinhId) {
        //     return res.render('payment-dashboard', { 
        //         error: 'Không tìm thấy thông tin học sinh liên quan.', 
        //         payments: [] 
        //     });
        // }

        // 1. Tìm id_HocSinh liên quan qua PhuHuynh
        const phuHuynh = await PhuHuynh.findOne({
            where: { MaPH: username }, // Dùng username (MaPH) để tìm
            attributes: [], // Không cần lấy thuộc tính của PhuHuynh
            include: [{ 
                model: HocSinh, 
                as: 'hocsinh', 
                attributes: ['id'] // Chỉ cần lấy id của học sinh
            }],
        });

        const hocSinhId = phuHuynh?.hocsinh?.id; // Lấy id của học sinh liên quan
        
        if (!hocSinhId) {
            // Lỗi này giờ có thể là do thiếu dữ liệu MaPH trong CSDL
            return res.render('payment-dashboard', { 
                error: 'Không tìm thấy thông tin học sinh liên quan.', 
                payments: [] 
            });
        }

        // 2. Lấy danh sách công nợ từ CSDL (ENTITY_CONGNO)
        const payments = await ThanhToanHocPhi.findAll({
            where: { id_HocSinh: hocSinhId },
            order: [['NamHoc', 'DESC'], ['HocKy', 'DESC']],
        });

        // 3. Hiển thị giao diện
        res.render('payment-dashboard', { 
            error: null, 
            payments: payments,
            phuHuynh: phuHuynh,
            // Thêm logic tổng hợp nếu cần: Ví dụ tính tổng công nợ
            totalCongNo: payments.reduce((sum, p) => sum + (p.CongNo - p.TienDaNop), 0),
        });

    } catch (err) {
        console.error('Lỗi CSDL khi truy vấn công nợ:', err);
        // 4. Alternative flow: Lỗi CSDL
        res.render('payment-dashboard', { 
            error: 'Lỗi hệ thống, vui lòng thử lại sau.', 
            payments: [] 
        });
    }
}

async function getPaymentDetails(req, res) {
    
}

// Hàm này sẽ được dùng cho việc khởi tạo thanh toán (bước sau)
async function initiatePayment(req, res) {
const { paymentId } = req.body; // id của bản ghi ThanhToanHocPhi
    const { user } = req.session;

    if (!user || user.role !== 'phụ huynh') {
        return res.status(403).json({ error: 'Truy cập bị từ chối.' });
    }

    try {
        const payment = await ThanhToanHocPhi.findByPk(paymentId);

        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin công nợ.' });
        }
        
        const conNoHienTai = payment.CongNo - payment.TienDaNop;

        // 🚨 BƯỚC 1: Kiểm tra Công nợ (Theo đặc tả [cite: 8, 10])
        if (conNoHienTai <= 0) {
             // Alternative flow: Không còn công nợ cần thanh toán
             return res.status(200).json({ 
                 message: 'Không còn học phí cần thanh toán cho kỳ này.', 
                 status: 'NO_DEBT' 
             });
        }
        
        // 🚨 BƯỚC 2: Xử lý hiển thị mã QR (Theo đặc tả [cite: 8, 10])
        // Giả lập logic: Cập nhật trạng thái chờ thanh toán (nếu có)
        // payment.TrangThai = 'Đang chờ thanh toán'; 
        // await payment.save();

        // Trả về dữ liệu cần thiết để tạo/hiển thị mã QR trên giao diện
        return res.json({ 
            message: 'Vui lòng sử dụng mã QR để thanh toán.', 
            qrData: `ThanhToan|${payment.id}|SoTien=${conNoHienTai}`, // Dữ liệu giả lập QR
            amount: conNoHienTai,
            status: 'QR_DISPLAYED'
        });

    } catch (err) {
        console.error('Lỗi khi xử lý thanh toán:', err);
        [cite_start]// Exception: Lỗi CSDL [cite: 8, 10]
        return res.status(500).json({ error: 'Lỗi CSDL, vui lòng thử lại sau.' });
    }
}


module.exports = { showPaymentDashboard, getPaymentDetails, initiatePayment };