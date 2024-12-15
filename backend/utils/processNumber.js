// Định dạng số để hiển thị giá trị tiền tệ hoặc số liệu trong giao diện.
const formatterNumber = val => {
    if (!val) return 0;
    return `${val}`
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        .replace(/\.(?=\d{0,2}$)/g, ',');
};

// Loại bỏ ký hiệu tiền tệ và dấu định dạng để xử lý số nguyên hoặc số thực.
// Chuẩn hóa chuỗi số đầu vào từ giao diện để lưu trữ hoặc tính toán.
const parserNumber = val => {
    if (!val) return 0;
    return Number.parseFloat(
        val.replace(/\$\s?|(\.*)/g, '').replace(/(\,{1})/g, '.')
    ).toFixed(2);
};

export { formatterNumber, parserNumber };
