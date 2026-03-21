import jwt from 'jsonwebtoken';


export class AuthMiddleware {
    constructor() {
    }

    async verifyToken(req, res, next) {
        const cookieToken = req.cookies?.token;
        const authHeader = req.headers?.authorization;
        const xAccessToken = req.headers?.['x-access-token'];
        let token = typeof cookieToken === 'string' ? cookieToken.trim() : '';

        if (!token && typeof authHeader === 'string') {
            const match = authHeader.match(/^Bearer\s+(.+)$/i);
            token = match ? match[1].trim() : authHeader.trim();
        }

        if (!token && typeof xAccessToken === 'string') {
            token = xAccessToken.trim();
        }
        console.log("Token", token)

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user || decoded;

            //console.log("User Data",req.user);
            next(); 
        } catch (error) {
            console.error("JWT Verification Error:", error);
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
    }
}

