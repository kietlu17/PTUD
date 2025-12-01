-- Dữ liệu mẫu cho bảng VaiTro
INSERT INTO "VaiTro" ("id", "TenVaiTro", "mota") VALUES
(1, 'học sinh', 'Vai trò học sinh'),
(2, 'phụ huynh', 'Vai trò phụ huynh'),
(3, 'giáo viên', 'Vai trò giáo viên'),
(4, 'ban giám hiệu', 'Vai trò ban giám hiệu'),
(5, 'sở giáo dục', 'Vai trò sở giáo dục'),
(6, 'admin', 'Quản trị viên');

-- Dữ liệu mẫu cho bảng Truong
INSERT INTO "Truong" ("id", "name") VALUES
(1, 'Trường THPT Phú Mỹ'),
(2, 'Trường THPT Nguyễn Trãi');

-- Dữ liệu mẫu cho bảng ToHopMon
INSERT INTO "ToHopMon" ("id", "TenToHop", "mota") VALUES
(1, 'Khoa học tự nhiên', 'Toán, Lý, Hóa'),
(2, 'Khoa học xã hội', 'Văn, Sử, Địa');

-- Dữ liệu mẫu cho bảng GiaoVien
INSERT INTO "GiaoVien" ("id", "HoVaTen", "NgaySinh", "GioiTinh", "ViTri", "SDT", "DiaChi", "email", "NgayThamGia", "id_truong") VALUES
(1, 'Nguyễn Văn C', '1980-03-10', 'Nam', 'Giáo viên Toán', '0123456789', 'TP. HCM', 'nguyenvanc@example.com', '2005-09-01', 1),
(2, 'Trần Thị D', '1985-07-25', 'Nữ', 'Giáo viên Văn', '0987654321', 'TP. HCM', 'tranthid@example.com', '2010-09-01', 1);

-- Dữ liệu mẫu cho bảng Lop
INSERT INTO "Lop" ("id", "TenLop", "id_ToHopMon", "id_GiaoVienChuNhiem") VALUES
(1, '10A1', 1, 1),
(2, '10A2', 2, 2);

-- Dữ liệu mẫu cho bảng MonHoc
INSERT INTO "MonHoc" ("id", "TenMon", "SoTiet") VALUES
(1, 'Toán', 45),
(2, 'Văn', 45),
(3, 'Anh', 45);

-- Dữ liệu mẫu cho bảng HocSinh
INSERT INTO "HocSinh" ("id", "MaHS", "HoVaTen", "NgaySinh", "GioiTinh", "id_Lop", "id_school") VALUES
(1, 'hocsinh1', 'Nguyễn Văn A', '2010-05-15', 'Nam', 1, 1),
(2, 'hocsinh2', 'Trần Thị B', '2011-08-20', 'Nữ', 2, 1);

-- Dữ liệu mẫu cho bảng BangPhanCongGiaoVien
INSERT INTO "BangPhanCongGiaoVien" ("id", "id_GiaoVien", "id_MonHoc", "id_Lop", "KyHoc", "NamHoc", "NgayPhanCong") VALUES
(1, 1, 1, 1, '1', '2025-2026', '2025-08-15'),
(2, 2, 2, 2, '1', '2025-2026', '2025-08-15');

-- Dữ liệu mẫu cho bảng BangPhanCongGiaoVienChuNhiem
INSERT INTO "BangPhanCongGiaoVienChuNhiem" ("id", "id_GiaoVien", "id_Lop", "NamHoc", "NgayPhanCong") VALUES
(1, 1, 1, '2025-2026', '2025-08-15'),
(2, 2, 2, '2025-2026', '2025-08-15');

-- Dữ liệu mẫu cho bảng DiemDanh
INSERT INTO "DiemDanh" ("application_id", "student_id", "NgayNghi", "LyDo", "TinhTrang", "NgayNop", "pproved_by") VALUES
(1, 1, '2025-09-01', 'Ốm', 'Đã duyệt', '2025-09-02', 1),
(2, 2, '2025-09-03', 'Gia đình có việc', 'Đã duyệt', '2025-09-04', 2);

-- Dữ liệu mẫu cho bảng DiemSo
INSERT INTO "DiemSo" ("id", "id_HocSinh", "id_MonHoc", "HocKy", "NamHoc", "DiemThuongKy", "DiemGiuaKy", "DiemCuoiKy", "DiemTrungBinh") VALUES
(1, 1, 1, '1', '2025-2026', 8.5, 7.0, 9.0, 8.2),
(2, 2, 2, '1', '2025-2026', 7.5, 8.0, 8.5, 8.0);

-- Dữ liệu mẫu cho bảng LichSuDiem
INSERT INTO "LichSuDiem" ("id", "id_DiemSo", "LoaiDiem", "DiemCu", "DiemMoi", "NguoiSua", "ThoiGian", "LyDo") VALUES
(1, 1, 'DiemThuongKy', 8.0, 8.5, 1, '2025-09-10', 'Cập nhật điểm do nhập sai');



-- Dữ liệu mẫu cho bảng NhanXetHocTap
INSERT INTO "NhanXetHocTap" ("id", "id_HocSinh", "id_GiaoVien", "HocKy", "NamHoc", "NoiDung", "NgayTao") VALUES
(1, 1, 1, '1', '2025-2026', 'Học sinh chăm chỉ, tiến bộ', '2025-09-15');

-- Dữ liệu mẫu cho bảng HanhKiem
INSERT INTO "HanhKiem" ("id", "id_HocSinh", "HocKy", "NamHoc", "LoaiHanhKiem", "NhanXet", "NguoiDanhGia", "NgayDanhGia") VALUES
(1, 1, '1', '2025-2026', 'Tốt', 'Học sinh ngoan, lễ phép', 1, '2025-09-20');



-- Dữ liệu mẫu cho bảng ThanhToanHocPhi
INSERT INTO "ThanhToanHocPhi" ("id", "id_HocSinh", "HocKy", "NamHoc", "CongNo", "TienDaNop", "NgayThanhToan", "PhuongThuc", "TrangThai") VALUES
(1, 1, '1', '2025-2026', 5000000, 2500000, '2025-09-01', 'Chuyển khoản', 'Đã thanh toán');

-- Dữ liệu mẫu cho bảng BaiTap
INSERT INTO "BaiTap" ("id", "TieuDe", "NoiDung", "id_MonHoc", "id_Lop", "id_GiaoVien", "NgayGiao", "HanNop", "File", "TrangThai") VALUES
(1, 'Bài tập Toán tuần 1', 'Giải các bài tập trong sách giáo khoa', 1, 1, 1, '2025-09-01', '2025-09-07', 'baitap1.pdf', 'Đang giao');

-- Dữ liệu mẫu cho bảng BaiNop
INSERT INTO "BaiNop" ("id", "id_BaiTap", "id_HocSinh", "NgayNop", "file_path", "DiemSo", "NhanXet", "NgayCham", "TrangThai") VALUES
(1, 1, 1, '2025-09-05', 'baitap1_hocsinh1.pdf', 9.0, 'Bài làm tốt', '2025-09-06', 'Đã chấm');

-- Dữ liệu mẫu cho bảng ThoiKhoaBieu
INSERT INTO "ThoiKhoaBieu" ("id", "id_Lop", "id_MonHoc", "id_GiaoVien", "Thu", "Tiet", "HocKy", "NamHoc") VALUES
(1, 1, 1, 1, 'Hai', 1, '1', '2025-2026');

-- Dữ liệu mẫu cho bảng HocBa
INSERT INTO "HocBa" ("id", "id_HocSinh", "id_Lop", "id_Truong", "NamHoc", "HocKy", "DiemTrungBinh", "HanhKiem", "NhanXet") VALUES
(1, 1, 1, 1, '2025-2026', '1', 8.2, 'Tốt', 'Học sinh chăm chỉ, tiến bộ');

-- Dữ liệu mẫu cho bảng PhuHuynh
INSERT INTO "PhuHuynh" ("id", "MaPH", "HoVaTen", "id_HocSinh", "SDT", "email", "NgaySinh", "GioiTinh") VALUES
(1, 'phuhuynh1', 'Nguyễn Văn C', 1, '0123456789', 'phuhuynh1@example.com', '1980-03-10', 'Nam'),
(2, 'phuhuynh2', 'Trần Thị D', 2, '0987654321', 'phuhuynh2@example.com', '1985-07-25', 'Nữ');

-- Dữ liệu mẫu cho bảng BanGiamHieu
INSERT INTO "BanGiamHieu" ("id", "id_truong", "MaBGV", "HoVaTen", "NgaySinh", "GioiTinh", "SDT", "DiaChi", "email") VALUES
(1, 1, 'bangiamhieu1', 'Nguyễn Văn E', '1970-01-01', 'Nam', '0123456789', 'TP. HCM', 'bangiamhieu1@example.com'),
(2, 2, 'bangiamhieu2', 'Trần Thị F', '1975-02-02', 'Nữ', '0987654321', 'TP. HCM', 'bangiamhieu2@example.com');

-- Dữ liệu mẫu cho bảng TaiKhoan
INSERT INTO "TaiKhoan" ("id", "username", "password", "id_role") VALUES
(1, 'hocsinh1', '1', 1),
(2, 'phuhuynh1', '1', 2),
(3, 'giaovien1', '1', 3),
(4, 'bangiamhieu1', '1', 4),
(5, 'sogiaoduc1', '1', 5),
(6, 'admin1', '1', 6);

-- Dữ liệu mẫu cho bảng ThongBao
INSERT INTO "ThongBao" ("id", "TieuDe", "NoiDung", "NguoiDang", "NgayDang", "NgayCapNhat") VALUES
(1, 'Thông báo nghỉ học', 'Học sinh nghỉ học ngày 01/09/2025', 1, '2025-08-30', '2025-08-30');

-- Dữ liệu mẫu cho bảng YeuCauSuaDiem
INSERT INTO "YeuCauSuaDiem" ("id", "id_DiemSo", "id_GiaoVien", "NgayGui", "LoaiDiem", "DiemCu", "DiemMoi", "LyDo", "TrangThai", "NguoiDuyet", "ThoiGianDuyet") VALUES
(1, 1, 1, '2025-09-05', 'DiemThuongKy', 8.0, 8.5, 'Cập nhật điểm do nhập sai', 'Đã duyệt', 2, '2025-09-06');