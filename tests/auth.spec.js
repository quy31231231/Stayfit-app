const { test, expect } = require('@playwright/test');

// Smoke test màn đăng nhập/đăng ký — đường tới hạn (hỏng là không vào được app).
// Không cần Supabase: màn auth render trước khi đăng nhập.
test.describe('Màn đăng nhập / đăng ký', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mặc định là tab Đăng nhập với trường SĐT + Mật khẩu', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    await expect(page.getByText('Số điện thoại')).toBeVisible();
    await expect(page.getByText('Mật khẩu', { exact: true })).toBeVisible();
    // Mặc định KHÔNG ở chế độ đăng ký → không có ô Xác nhận mật khẩu.
    await expect(page.getByText('Xác nhận mật khẩu')).toHaveCount(0);
  });

  test('chuyển sang Đăng ký hiện Họ và tên + Xác nhận mật khẩu', async ({ page }) => {
    await page.getByRole('button', { name: 'Đăng ký' }).first().click();
    await expect(page.getByRole('heading', { name: 'Tạo tài khoản' })).toBeVisible();
    await expect(page.getByText('Họ và tên')).toBeVisible();
    await expect(page.getByText('Xác nhận mật khẩu')).toBeVisible();
  });

  test('nút con mắt hiện/ẩn mật khẩu', async ({ page }) => {
    const pw = page.getByPlaceholder('Tối thiểu 6 ký tự');
    await expect(pw).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Hiện/ẩn mật khẩu' }).click();
    await expect(pw).toHaveAttribute('type', 'text');
  });

  test('SĐT không hợp lệ hiện toast lỗi', async ({ page }) => {
    await page.getByPlaceholder('VD: 0901234567').fill('123');
    await page.getByPlaceholder('Tối thiểu 6 ký tự').fill('abcdef');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).last().click();
    await expect(page.getByText('Số điện thoại không hợp lệ!')).toBeVisible();
  });
});
