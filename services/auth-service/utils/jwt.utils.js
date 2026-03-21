import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const userIdString = userId.toString();
  //console.log("userId", userIdString);
  const token = jwt.sign({ userId: userIdString }, process.env.JWT_SECRET, {
    expiresIn: "31d",
  });

  const refreshToken = jwt.sign({ userId: userIdString }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("auth-token", token, {
    expires: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
  });

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
  });

  return { token, refreshToken };
};