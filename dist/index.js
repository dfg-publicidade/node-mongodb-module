"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultService = exports.MongoManager = void 0;
const mongoManager_1 = __importDefault(require("./datasources/mongoManager"));
exports.MongoManager = mongoManager_1.default;
const defaultService_1 = __importDefault(require("./services/defaultService"));
exports.DefaultService = defaultService_1.default;
