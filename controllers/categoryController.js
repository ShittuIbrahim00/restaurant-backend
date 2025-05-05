import Category from "../models/categoryModel.js";


export const createCategory =async (req, res) => {
    try {
        const {admin_id, name, desc,} = req.body;

        const img =  req.files?.img?.[0]?.path || null;

        const existingCategory = await Category.findOne({name})
        if(existingCategory){
            return res.status(400).json({message:"Category already exists"})

        }

        const category = new Category({
            admin_id,
            name,
            desc,
            img,
        })

        await category.save()

        res.status(201).json({
            success:true,
            message:"Category Created Successfully",
            category
        })

    } catch (error) {
       res.status(500).json({success:false, message:error.message}) 
    }
}