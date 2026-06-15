package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.model.Order;
import com.haihoan2874.techhub.model.OrderItem;
import com.haihoan2874.techhub.model.OrderStatus;
import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.repository.OrderRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int DETAIL_COLUMN_COUNT = 16;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public byte[] exportOrderRevenueWorkbook(
            String period,
            LocalDate fromDate,
            LocalDate toDate,
            Authentication authentication
    ) {
        ReportPeriod reportPeriod = resolvePeriod(period, fromDate, toDate);
        List<Order> orders = orderRepository.findReportOrdersBetween(reportPeriod.startDate(), reportPeriod.endDate());
        Map<UUID, User> usersById = loadUsersById(orders);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bao cao don hang");
            ReportStyles styles = createStyles(workbook);
            int rowIndex = 0;

            rowIndex = writeTitle(sheet, styles, rowIndex);
            rowIndex = writeMetadata(sheet, styles, reportPeriod, authentication, rowIndex);
            rowIndex = writeQuickSummary(sheet, styles, orders, rowIndex);
            rowIndex = writeOrderDetails(sheet, styles, orders, usersById, rowIndex);
            writeFooterSummary(sheet, styles, orders, rowIndex);

            formatSheet(sheet);
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot export order report workbook", exception);
        }
    }

    public String buildReportFilename(String period, LocalDate fromDate, LocalDate toDate) {
        ReportPeriod reportPeriod = resolvePeriod(period, fromDate, toDate);
        String start = reportPeriod.startDate().toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String end = reportPeriod.endDate().toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        return "s-life-order-report-" + reportPeriod.key().toLowerCase(Locale.ROOT) + "-" + start + "-" + end + ".xlsx";
    }

    private int writeTitle(Sheet sheet, ReportStyles styles, int rowIndex) {
        Row row = sheet.createRow(rowIndex++);
        row.setHeightInPoints(30);
        Cell cell = row.createCell(0);
        cell.setCellValue("BÁO CÁO ĐƠN HÀNG VÀ DOANH THU S-LIFE");
        cell.setCellStyle(styles.title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, DETAIL_COLUMN_COUNT - 1));
        return rowIndex + 1;
    }

    private int writeMetadata(
            Sheet sheet,
            ReportStyles styles,
            ReportPeriod period,
            Authentication authentication,
            int rowIndex
    ) {
        rowIndex = writeSectionTitle(sheet, styles, rowIndex, "THÔNG TIN BÁO CÁO");
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Kỳ báo cáo", period.label());
        rowIndex = writeKeyValue(
                sheet,
                styles,
                rowIndex,
                "Thời gian",
                period.startDate().toLocalDate().format(DATE_FORMATTER) + " - " + period.endDate().toLocalDate().format(DATE_FORMATTER)
        );
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Ngày xuất", LocalDateTime.now().format(DATE_TIME_FORMATTER));
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Người xuất", authentication != null ? authentication.getName() : "");
        return rowIndex + 1;
    }

    private int writeQuickSummary(Sheet sheet, ReportStyles styles, List<Order> orders, int rowIndex) {
        rowIndex = writeSectionTitle(sheet, styles, rowIndex, "TÓM TẮT NHANH");

        Row header = sheet.createRow(rowIndex++);
        writeStyledCell(header, 0, "Tổng đơn", styles.summaryHeader);
        writeStyledCell(header, 1, "Tổng SL sản phẩm", styles.summaryHeader);
        writeStyledCell(header, 2, "Tổng tiền hàng", styles.summaryHeader);
        writeStyledCell(header, 3, "Tổng giảm giá", styles.summaryHeader);
        writeStyledCell(header, 4, "Phí vận chuyển", styles.summaryHeader);
        writeStyledCell(header, 5, "Tổng thành tiền", styles.summaryHeader);

        Row value = sheet.createRow(rowIndex++);
        writeNumberCell(value, 0, orders.size(), styles.summaryValue);
        writeNumberCell(value, 1, sumItemCount(orders), styles.summaryValue);
        writeMoneyCell(value, 2, sumSubtotal(orders), styles.summaryValueMoney);
        writeMoneyCell(value, 3, sumDiscount(orders), styles.summaryValueMoney);
        writeMoneyCell(value, 4, BigDecimal.ZERO, styles.summaryValueMoney);
        writeMoneyCell(value, 5, sumTotal(orders), styles.summaryValueMoney);

        return rowIndex + 1;
    }

    private int writeOrderDetails(
            Sheet sheet,
            ReportStyles styles,
            List<Order> orders,
            Map<UUID, User> usersById,
            int rowIndex
    ) {
        rowIndex = writeSectionTitle(sheet, styles, rowIndex, "CHI TIẾT ĐƠN HÀNG");

        Row header = sheet.createRow(rowIndex++);
        String[] columns = {
                "STT",
                "Mã đơn hàng",
                "Ngày đặt",
                "Khách hàng",
                "Email",
                "Số điện thoại",
                "Trạng thái",
                "Thanh toán",
                "Sản phẩm trong đơn",
                "Tổng SL",
                "Tổng tiền hàng",
                "Giảm giá",
                "Phí vận chuyển",
                "Thành tiền",
                "Mã giảm giá",
                "Ghi chú"
        };
        for (int column = 0; column < columns.length; column++) {
            writeStyledCell(header, column, columns[column], styles.tableHeader);
        }

        int index = 1;
        for (Order order : orders) {
            User user = usersById.get(order.getUserId());
            BigDecimal discount = valueOrZero(order.getDiscountAmount());
            BigDecimal total = valueOrZero(order.getTotal());
            BigDecimal subtotal = total.add(discount);

            Row row = sheet.createRow(rowIndex++);
            row.setHeightInPoints(42);
            writeNumberCell(row, 0, index++, styles.center);
            writeStyledCell(row, 1, order.getOrderNumber(), styles.body);
            writeStyledCell(row, 2, order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_TIME_FORMATTER) : "", styles.body);
            writeStyledCell(row, 3, getCustomerName(user, order), styles.body);
            writeStyledCell(row, 4, user != null ? user.getEmail() : "", styles.body);
            writeStyledCell(row, 5, getPhone(user, order), styles.body);
            writeStyledCell(row, 6, getStatusLabel(order.getStatus()), styles.body);
            writeStyledCell(row, 7, getPaymentMethodLabel(order.getPaymentMethod()), styles.body);
            writeStyledCell(row, 8, getProductSummary(order), styles.wrapBody);
            writeNumberCell(row, 9, getItemCount(order), styles.center);
            writeMoneyCell(row, 10, subtotal, styles.money);
            writeMoneyCell(row, 11, discount, styles.money);
            writeMoneyCell(row, 12, BigDecimal.ZERO, styles.money);
            writeMoneyCell(row, 13, total, styles.moneyBold);
            writeStyledCell(row, 14, order.getVoucherCode() != null ? order.getVoucherCode() : "", styles.body);
            writeStyledCell(row, 15, order.getNotes() != null ? order.getNotes() : "", styles.wrapBody);
        }

        return rowIndex + 1;
    }

    private void writeFooterSummary(Sheet sheet, ReportStyles styles, List<Order> orders, int rowIndex) {
        rowIndex = writeSectionTitle(sheet, styles, rowIndex, "TỔNG KẾT CHI TIẾT");
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng số đơn hàng", String.valueOf(orders.size()));
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng số lượng sản phẩm", String.valueOf(sumItemCount(orders)));
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng tiền hàng", sumSubtotal(orders).toPlainString());
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng giảm giá", sumDiscount(orders).toPlainString());
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng phí vận chuyển", "0");
        rowIndex = writeKeyValue(sheet, styles, rowIndex, "Tổng thành tiền", sumTotal(orders).toPlainString());
        rowIndex++;

        rowIndex = writeGroupedSummary(sheet, styles, orders, rowIndex, "THỐNG KÊ THEO TRẠNG THÁI", order -> getStatusLabel(order.getStatus()));
        writeGroupedSummary(sheet, styles, orders, rowIndex + 1, "THỐNG KÊ THEO PHƯƠNG THỨC THANH TOÁN", order -> {
            String label = getPaymentMethodLabel(order.getPaymentMethod());
            return label.isBlank() ? "Không xác định" : label;
        });
    }

    private int writeGroupedSummary(
            Sheet sheet,
            ReportStyles styles,
            List<Order> orders,
            int rowIndex,
            String title,
            Function<Order, String> groupResolver
    ) {
        rowIndex = writeSectionTitle(sheet, styles, rowIndex, title);

        Row header = sheet.createRow(rowIndex++);
        writeStyledCell(header, 0, "Nhóm", styles.tableHeader);
        writeStyledCell(header, 1, "Số đơn", styles.tableHeader);
        writeStyledCell(header, 2, "Tổng SL", styles.tableHeader);
        writeStyledCell(header, 3, "Tổng thành tiền", styles.tableHeader);

        Map<String, SummaryAccumulator> summaryByGroup = new LinkedHashMap<>();
        for (Order order : orders) {
            String key = groupResolver.apply(order);
            if (key == null || key.isBlank()) {
                key = "Không xác định";
            }
            summaryByGroup.computeIfAbsent(key, ignored -> new SummaryAccumulator()).add(order);
        }

        for (Map.Entry<String, SummaryAccumulator> entry : summaryByGroup.entrySet()) {
            SummaryAccumulator summary = entry.getValue();
            Row row = sheet.createRow(rowIndex++);
            writeStyledCell(row, 0, entry.getKey(), styles.body);
            writeNumberCell(row, 1, summary.orderCount, styles.center);
            writeNumberCell(row, 2, summary.itemCount, styles.center);
            writeMoneyCell(row, 3, summary.total, styles.moneyBold);
        }
        return rowIndex;
    }

    private int writeSectionTitle(Sheet sheet, ReportStyles styles, int rowIndex, String title) {
        Row row = sheet.createRow(rowIndex++);
        row.setHeightInPoints(23);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(styles.section);
        sheet.addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), 0, DETAIL_COLUMN_COUNT - 1));
        return rowIndex;
    }

    private int writeKeyValue(Sheet sheet, ReportStyles styles, int rowIndex, String key, String value) {
        Row row = sheet.createRow(rowIndex++);
        writeStyledCell(row, 0, key, styles.metaKey);
        writeStyledCell(row, 1, value, styles.metaValue);
        return rowIndex;
    }

    private void formatSheet(Sheet sheet) {
        int[] widths = {
                8, 22, 18, 24, 28, 16, 18, 24, 62, 12, 18, 16, 16, 18, 16, 28
        };
        for (int column = 0; column < widths.length; column++) {
            sheet.setColumnWidth(column, widths[column] * 256);
        }

        int detailHeaderRow = findDetailHeaderRow(sheet);
        if (detailHeaderRow >= 0) {
            sheet.createFreezePane(0, detailHeaderRow + 1);
            sheet.setAutoFilter(new CellRangeAddress(detailHeaderRow, detailHeaderRow, 0, DETAIL_COLUMN_COUNT - 1));
        }
    }

    private int findDetailHeaderRow(Sheet sheet) {
        for (Row row : sheet) {
            Cell firstCell = row.getCell(0);
            if (firstCell != null
                    && firstCell.getCellType() == CellType.STRING
                    && "STT".equals(firstCell.getStringCellValue())) {
                return row.getRowNum();
            }
        }
        return -1;
    }

    private ReportStyles createStyles(Workbook workbook) {
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleFont.setColor(IndexedColors.WHITE.getIndex());

        Font whiteBoldFont = workbook.createFont();
        whiteBoldFont.setBold(true);
        whiteBoldFont.setColor(IndexedColors.WHITE.getIndex());

        Font boldFont = workbook.createFont();
        boldFont.setBold(true);

        Font blueBoldFont = workbook.createFont();
        blueBoldFont.setBold(true);
        blueBoldFont.setColor(IndexedColors.BLUE.getIndex());

        CellStyle title = workbook.createCellStyle();
        title.setFont(titleFont);
        title.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        title.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        title.setAlignment(HorizontalAlignment.CENTER);
        title.setVerticalAlignment(VerticalAlignment.CENTER);

        CellStyle section = createBaseStyle(workbook);
        section.setFont(whiteBoldFont);
        section.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        section.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle tableHeader = createBaseStyle(workbook);
        tableHeader.setFont(whiteBoldFont);
        tableHeader.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        tableHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        tableHeader.setAlignment(HorizontalAlignment.CENTER);
        tableHeader.setWrapText(true);

        CellStyle metaKey = createBaseStyle(workbook);
        metaKey.setFont(boldFont);
        metaKey.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        metaKey.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle metaValue = createBaseStyle(workbook);

        CellStyle summaryHeader = createBaseStyle(workbook);
        summaryHeader.setFont(whiteBoldFont);
        summaryHeader.setFillForegroundColor(IndexedColors.TEAL.getIndex());
        summaryHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        summaryHeader.setAlignment(HorizontalAlignment.CENTER);

        CellStyle summaryValue = createBaseStyle(workbook);
        summaryValue.setFont(blueBoldFont);
        summaryValue.setAlignment(HorizontalAlignment.CENTER);

        CellStyle summaryValueMoney = createMoneyStyle(workbook, blueBoldFont);

        CellStyle body = createBaseStyle(workbook);

        CellStyle wrapBody = createBaseStyle(workbook);
        wrapBody.setWrapText(true);
        wrapBody.setVerticalAlignment(VerticalAlignment.TOP);

        CellStyle center = createBaseStyle(workbook);
        center.setAlignment(HorizontalAlignment.CENTER);

        CellStyle money = createMoneyStyle(workbook, null);
        CellStyle moneyBold = createMoneyStyle(workbook, boldFont);

        return new ReportStyles(
                title,
                section,
                tableHeader,
                metaKey,
                metaValue,
                summaryHeader,
                summaryValue,
                summaryValueMoney,
                body,
                wrapBody,
                center,
                money,
                moneyBold
        );
    }

    private CellStyle createBaseStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createMoneyStyle(Workbook workbook, Font font) {
        CellStyle style = createBaseStyle(workbook);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0 \"đ\""));
        if (font != null) {
            style.setFont(font);
        }
        return style;
    }

    private void writeStyledCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value == null ? "" : value);
        cell.setCellStyle(style);
    }

    private void writeNumberCell(Row row, int column, int value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void writeMoneyCell(Row row, int column, BigDecimal value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(valueOrZero(value).doubleValue());
        cell.setCellStyle(style);
    }

    private Map<UUID, User> loadUsersById(List<Order> orders) {
        List<UUID> userIds = orders.stream()
                .map(Order::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private String getCustomerName(User user, Order order) {
        if (user != null) {
            String fullName = ((user.getLastName() != null ? user.getLastName() : "") + " "
                    + (user.getFirstName() != null ? user.getFirstName() : "")).trim();
            if (!fullName.isBlank()) {
                return fullName;
            }
            return user.getUsername();
        }
        if (order.getShippingAddress() != null) {
            return order.getShippingAddress().getFullName();
        }
        return "";
    }

    private String getPhone(User user, Order order) {
        if (user != null && user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            return user.getPhoneNumber();
        }
        if (order.getShippingAddress() != null) {
            return order.getShippingAddress().getPhone();
        }
        return "";
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int getItemCount(Order order) {
        if (order.getItems() == null) {
            return 0;
        }
        return order.getItems().stream()
                .mapToInt(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                .sum();
    }

    private String getProductSummary(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return "";
        }
        return order.getItems().stream()
                .map(this::formatOrderItem)
                .collect(Collectors.joining("\n"));
    }

    private String formatOrderItem(OrderItem item) {
        int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        BigDecimal price = valueOrZero(item.getPrice());
        BigDecimal subtotal = valueOrZero(item.getSubtotal());
        return item.getProductName() + " x " + quantity
                + " | Đơn giá: " + price.toPlainString()
                + " | Thành tiền: " + subtotal.toPlainString();
    }

    private int sumItemCount(List<Order> orders) {
        return orders.stream().mapToInt(this::getItemCount).sum();
    }

    private BigDecimal sumDiscount(List<Order> orders) {
        return orders.stream()
                .map(order -> valueOrZero(order.getDiscountAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumTotal(List<Order> orders) {
        return orders.stream()
                .map(order -> valueOrZero(order.getTotal()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumSubtotal(List<Order> orders) {
        return orders.stream()
                .map(order -> valueOrZero(order.getTotal()).add(valueOrZero(order.getDiscountAmount())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String getStatusLabel(OrderStatus status) {
        if (status == null) {
            return "";
        }
        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case PROCESSING -> "Đang chuẩn bị hàng";
            case SHIPPED -> "Đang giao";
            case DELIVERED -> "Đã giao";
            case CANCELLED -> "Đã hủy";
        };
    }

    private String getPaymentMethodLabel(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "";
        }
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            return "Thanh toán khi nhận hàng";
        }
        if ("VNPAY".equalsIgnoreCase(paymentMethod) || "ONLINE".equalsIgnoreCase(paymentMethod)) {
            return "Thanh toán trực tuyến";
        }
        return paymentMethod;
    }

    private ReportPeriod resolvePeriod(String period, LocalDate fromDate, LocalDate toDate) {
        String normalizedPeriod = period == null ? "MONTH" : period.toUpperCase(Locale.ROOT);
        LocalDate today = LocalDate.now();

        if ("CUSTOM".equals(normalizedPeriod)) {
            if (fromDate == null || toDate == null) {
                throw new IllegalArgumentException("fromDate and toDate are required for custom report period");
            }
            if (fromDate.isAfter(toDate)) {
                throw new IllegalArgumentException("fromDate must be before or equal to toDate");
            }
            return new ReportPeriod(
                    "CUSTOM",
                    "Tùy chọn",
                    fromDate.atStartOfDay(),
                    toDate.atTime(LocalTime.MAX)
            );
        }

        LocalDate startDate;
        String label;
        switch (normalizedPeriod) {
            case "TODAY" -> {
                startDate = today;
                label = "Hôm nay";
            }
            case "WEEK" -> {
                startDate = today.with(DayOfWeek.MONDAY);
                label = "Tuần này";
            }
            case "QUARTER" -> {
                int firstMonthOfQuarter = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                startDate = LocalDate.of(today.getYear(), firstMonthOfQuarter, 1);
                label = "Quý này";
            }
            case "YEAR" -> {
                startDate = LocalDate.of(today.getYear(), 1, 1);
                label = "Năm nay";
            }
            case "MONTH" -> {
                startDate = today.withDayOfMonth(1);
                label = "Tháng này";
            }
            default -> {
                normalizedPeriod = "MONTH";
                startDate = today.withDayOfMonth(1);
                label = "Tháng này";
            }
        }

        return new ReportPeriod(
                normalizedPeriod,
                label,
                startDate.atStartOfDay(),
                today.atTime(LocalTime.MAX)
        );
    }

    private class SummaryAccumulator {
        private int orderCount;
        private int itemCount;
        private BigDecimal total = BigDecimal.ZERO;

        private void add(Order order) {
            orderCount++;
            itemCount += getItemCount(order);
            total = total.add(valueOrZero(order.getTotal()));
        }
    }

    private record ReportStyles(
            CellStyle title,
            CellStyle section,
            CellStyle tableHeader,
            CellStyle metaKey,
            CellStyle metaValue,
            CellStyle summaryHeader,
            CellStyle summaryValue,
            CellStyle summaryValueMoney,
            CellStyle body,
            CellStyle wrapBody,
            CellStyle center,
            CellStyle money,
            CellStyle moneyBold
    ) {}

    private record ReportPeriod(
            String key,
            String label,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {}
}
