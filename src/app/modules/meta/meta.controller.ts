import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { MetaService } from "./meta.service";

const getDashboardMetaData = catchAsync(async (req, res) => {
    const result = await MetaService.getDashboardMetaData(req.user);

    console.log("result", result);

    sendSuccessResponse(
        res,
        result,
        "Dashboard Meta Data fetched successfully"
    );
});

const getBarChartData = catchAsync(async (req, res) => {
    const result = await MetaService.getBarChartData(req.query, req.user);

    sendSuccessResponse(res, result, "Bar Chart Data fetched successfully");
});

const revenueLineChartData = catchAsync(async (req, res) => {
    const result = await MetaService.revenueLineChartData(req.query);

    sendSuccessResponse(
        res,
        result,
        "Revenue Line Chart Data fetched successfully"
    );
});

export const MetaController = {
    getDashboardMetaData,
    getBarChartData,
    revenueLineChartData,
};
