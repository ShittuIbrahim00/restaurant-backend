import JsonWebToken from "jsonwebtoken";
import userModel from "../models/userModel.js";
import jsonwebtoken from "jsonwebtoken";

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).json({msg: "Not authorized"});

        const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decoded.id);
        next()
    } catch (error) {
        res.status(500).json({msg: "Invalid token"});
    };
};

// Role base access control

export const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({msg: "Access denied"})
        };
        next();
    };
};

