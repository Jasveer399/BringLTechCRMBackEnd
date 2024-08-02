import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    taskcompleteLink:{
        type: String,
    },
    timeFrom: {
      type: String,
      required: true,
    },
    timeTo: {
      type: String,
      required: true,
    },
    completion: {
      type: Boolean,
      default: false,
    },
    completiontime:{
      type: String,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    isModify: {
      type: Boolean,
      default: false,
    },
    newModifyDes: {
      type: String,
    },
    newModifyTimeto: {
      type: String,
    },
    newModifyTimeFrom: {
      type: String,
    },
    newModifyLink: {
      type: String,
    },
    isUpdated: {
      type: Boolean,
      default: false,
    },
    newUpdatedDes: {
      type: String,
    },
    newUpdatedTimeto: {
      type: String,
    },
    newUpdatedTimeFrom: {
      type: String,
    },
    newUpdateLink: {
      type: String,
    },
    date:{
      type: String,
    },
    newModifyDate:{
      type: String,
    },
    newUpdateDate:{
      type: String,
    },
    timeExceeded:{
      type: Boolean,
      default: false
    },
    tasktype:{
      type: String,
      required: true,
      enum: ["new", "modifyed", "updated",],
      default: "new",
    }
  },
  {
    timestamps: true,
  }
);
export const Task = mongoose.model("Task", taskSchema);
