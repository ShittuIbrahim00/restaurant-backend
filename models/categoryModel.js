import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {   
        admin_id: {type: mongoose.SchemaTypes.ObjectId, ref:"User", required:true },
        name:   {type:String, required:true},
        desc: {type:String, required:true},
        img:    {type: String},
    },
    {timestamps:true}
);

export default mongoose.model("Category", categorySchema) 