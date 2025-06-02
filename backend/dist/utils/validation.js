"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSigninData = exports.validateSignupData = void 0;
const User_1 = require("../entities/User");
const validateSignupData = (data) => {
    const errors = {};
    if (!data.email) {
        errors.email = "Email is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }
    if (!data.password) {
        errors.password = "Password is required";
    }
    else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.password =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    if (!data.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    }
    else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }
    if (!data.firstName) {
        errors.firstName = "First name is required";
    }
    else if (data.firstName.length < 2) {
        errors.firstName = "First name must be at least 2 characters long";
    }
    else if (!/^[a-zA-Z\s]+$/.test(data.firstName)) {
        errors.firstName = "First name can only contain letters and spaces";
    }
    if (!data.lastName) {
        errors.lastName = "Last name is required";
    }
    else if (data.lastName.length < 2) {
        errors.lastName = "Last name must be at least 2 characters long";
    }
    else if (!/^[a-zA-Z\s]+$/.test(data.lastName)) {
        errors.lastName = "Last name can only contain letters and spaces";
    }
    if (!data.userType) {
        errors.userType = "User type is required";
    }
    else if (!Object.values(User_1.UserType).includes(data.userType)) {
        errors.userType = "Invalid user type";
    }
    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
        errors.phone = "Please enter a valid phone number";
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
exports.validateSignupData = validateSignupData;
const validateSigninData = (data) => {
    const errors = {};
    if (!data.email) {
        errors.email = "Email is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }
    if (!data.password) {
        errors.password = "Password is required";
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
exports.validateSigninData = validateSigninData;
