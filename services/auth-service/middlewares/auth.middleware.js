import jwt from 'jsonwebtoken';


export class AuthMiddleware {
    constructor(parameters) {
    }

    async verifyToken(req, res, next) {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
    }
}

