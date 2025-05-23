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
      img:img,
    });

        await category.save()

        res.status(201).json({
            success:true,
            message:"Category Created Successfully",
            category
        })

    } catch (error) {
       res.status(500).json({success:false, message:error.message}) 
   
    }
};

export const getCategory = async(req,res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            success:true,
            message:"All categories",
            categories
        });
    } catch (err) {
        console.log(err)
        res.send({
            status:500,
            msg:"An error Occured"
        });
    }
}

export const deleteCategory = async(req,res)=>{
    try {
        const {id} = req.params;
        const category = await Category .findByIdAndDelete(id);

        if(!category){
            return res.status(404).json({message:"Category not found"});
        }

        res.status(200).json({message:"Category deleted successfully"});
    } catch (err) {
        res.status(500).json({message:error.message});
    }
}



