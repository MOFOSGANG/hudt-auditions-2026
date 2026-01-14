import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hudt-secret-key-2026-change-in-production';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
};

export const generateToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
            username: admin.username,
            role: admin.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export { JWT_SECRET };
