import { Request, Response } from "express";
import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { authServices } from "./auth.service";
import config from "../../config";


const logIn = catchAsync(async (req, res) => {
  const { accessToken, refreshToken, needPasswordChange } =
    await authServices.logIn(req.body);
 

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  });
  const data = {
    accessToken,
    refreshToken,
    needPasswordChange,
  };
  sendSuccessResponse(res, data, "User logged in successfully");
});

const changePassword = catchAsync(async (req, res) => {
  const result = await authServices.changePassword(req.user, req.body);

  sendSuccessResponse(res, result, "Password changed successfully");
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authServices.forgotPassword(req.body.email);

  sendSuccessResponse(res, result, "Check your email for reset link");
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await authServices.resetPassword(req.body);

  sendSuccessResponse(res, result, "Password reset successfully");
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const { accessToken } = await authServices.refresh(refreshToken);

  console.log(accessToken, "accessToken in refresh");

  res.cookie("accessToken", accessToken);
  sendSuccessResponse(res, {}, "Token refreshed successfully");
});

const LoginWithGoogle = catchAsync(async (req, res) => {
  res.header("Access-Control-Allow-Origin", `${config.client_url}`);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const clientRedirectRoute = req.query.redirect as string;

  const result = await authServices.LoginWithGoogle(clientRedirectRoute);

  res.json(result);
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code;
  const result = await authServices.googleCallback(code as string);

  if (result) {
    res.cookie("accessToken", result.accessToken);

    res.cookie("refreshToken", result.refreshToken, {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
    });

    const clientRedirectRoute = req.query.state || "";

    const url = clientRedirectRoute
      ? `${config.client_url}${clientRedirectRoute}`
      : `${config.client_url}/dashboard`;

    return res.redirect(url);
  }
  return res.redirect(`${config.client_url}/login`);
});

export const authControllers = {
  logIn,
  changePassword,
  forgotPassword,
  resetPassword,
  refresh,
  LoginWithGoogle,
  googleCallback,
};
